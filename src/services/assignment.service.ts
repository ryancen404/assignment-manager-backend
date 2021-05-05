import { Assignment, Class, User } from "../controller/request.type";
import AssignmentModel, { Assignment as AssignmentDB } from '../model/assignment.model';
import fs from 'fs';
import AssignmentFileModel, { AssignmentFile } from "../model/assignmentFile.model";
import StudentModel, { StudentAssignment } from "../model/student.model";
import TeacherModel, { TeacherDocument, TeacherPopulateDocument } from "../model/teacher.model";
import { Types } from "mongoose";
import ServiceConfig from "../config/service.config";
import { ParamError } from "../other/custom.error";
import ClassModel from "../model/classs.model";

/**
 * 根据用户类型和id来找到作业数组
 * @returns 
 */
const getAssignmentList = async (userType: User.Type, userId: string) => {
    if (userType === 0) {
        const myself = await TeacherModel.findById(userId);
        if (myself === null) {
            throw new ParamError("use error!");
        }
        const assignmentList = await toResEasyAssignment(myself);
        return assignmentList;
    } else {
        const studentAssignments = await StudentModel.findMyAssignments(userId);
        return studentAssignments.assignments;
    }
};

const toResEasyAssignment = async (teacher: TeacherDocument) => {
    const result = await Promise.all(teacher.assignments.map(async assignId => {
        const assignment = await AssignmentModel.findClass(assignId);
        const classes: Class.ResBaseClass[] = assignment.class.map(clazz => {
            const resClazz: Class.ResBaseClass = {
                classId: clazz.id,
                className: clazz.className,
                classNumber: clazz.classNumber
            }
            return resClazz;
        })
        const resAssignment: Assignment.ResEasyAssignment = {
            assignId,
            assignName: assignment.assignName,
            startTime: assignment.startTime.toLocaleDateString(),
            endTime: assignment.endTime.toLocaleDateString(),
            corrected: assignment.corrected,
            status: assignment.status,
            teacher: teacher.id,
            classs: classes,
            total: assignment.total,
            complete: assignment.complete,
        }
        return resAssignment;
    }));
    return result;
}

/**
 * 根据assignId返回完整的作业详情信息
 * @param assignId 作业唯一id
 * @return 找不到会为空
 */
const getAssignmentDetail = (_assignId: string) => {
    return null;
};

/**
 * create new Assignment
 */
const createNewAssignment = async (userId: string, assignment: Assignment.reqNewAssignment) => {
    const myself = await TeacherModel.findById(userId);
    if (myself === null) {
        throw new ParamError("user is error!")
    }
    try {
        let fileIds = []
        if (assignment.filesName !== undefined) {
            // 将附件信息存储到db
            fileIds = await Promise.all(assignment.filesName.map(async (name) => {
                const path = `./.data/assignment/${userId}/${name}`;
                const file: AssignmentFile = {
                    name,
                    link: path,
                    length: fs.statSync(path).size
                }
                const savedFile = await AssignmentFileModel.create(file);
                return savedFile._id;
            }));
        }
        const classesDB = await Promise.all(assignment.classIds.map(async id => await ClassModel.findMyStudents(id)));
        const classObjectIds = classesDB.filter(clazzDB => clazzDB !== null).map(clazzDB => clazzDB?._id);
        let count = 0;
        for (let i = 0; i < classesDB.length; i++) {
            if (classesDB[i] === null) {
                continue;
            }
            count += classesDB[i]!.students.length;
        }
        const newAssignment: AssignmentDB = {
            teacher: myself._id,
            assignName: assignment.name,
            startTime: new Date(assignment.startTime),
            endTime: new Date(assignment.endTime),
            class: classObjectIds,
            corrected: false,
            files: fileIds,
            total: count,
            complete: 0
        }
        const savedAssign = await AssignmentModel.create(newAssignment);
        ServiceConfig.logger("createNewAssignment success! id=", savedAssign.id);
        // 记录到教师的作业数组中
        myself.assignments.addToSet(savedAssign._id);
        const result = await myself.updateOne({ assignments: myself.assignments }).exec();
        if (result.ok !== 1) {
            ServiceConfig.logger("add new assignment to teacher error");
            return false;
        }

        // 记录到学生的作业数组中
        const newStudentAssigment: StudentAssignment = {
            assignment: savedAssign.id,
            assignmentStatus: false,
            corrected: false,
            score: 0
        }
        await Promise.all(classesDB.map(async clazz => {
            await Promise.all(clazz.students.map(async s => {
                s.assignments.addToSet({ ...newStudentAssigment });
                const updateResult = await s.updateOne({ assignments: s.assignments }).exec();
                if (updateResult.ok !== 1) {
                    ServiceConfig.logger(`student(${s.id}) add assignemnt(${savedAssign.id}) error!`);
                } else {
                    ServiceConfig.logger(`student(${s.id}) add assignemnt(${savedAssign.id}) success!`)
                }
            }));
        }));
        return true;
    } catch (error) {
        ServiceConfig.logger("createNewAssignment error:", error);
        return false;
    }
};

/**
 * 删除assignment
 */
const deleteAssignment = async (userId: string, assignId: string) => {
    const myself = await TeacherModel.findById(userId);
    const assignment = await AssignmentModel.findById(assignId);
    if (myself === null || assignment == null) {
        throw new ParamError("user is error!");
    }
    try {
        // 从教师的作业数组删除
        const newAssigns = myself.assignments.filter(a => !a.equals(assignId));
        const updateTeacherResult = await myself.updateOne({ assignments: newAssigns }).exec();
        if (updateTeacherResult.ok !== 1) {
            return false;
        }
        // 从学生的作业数组删除
        const classesDB = await Promise.all(assignment.class.map(async clazzId =>
            await ClassModel.findMyStudents(clazzId)));
        await Promise.all(classesDB.map(async clazzDB => {
            await Promise.all(clazzDB.students.map(async s => {
                const newAssign = s.assignments.filter(a => !a.assignment.equals(assignId));
                const updateStudentResult = await s.updateOne({ assignments: newAssign }).exec();
                if (updateStudentResult.ok !== 1) {
                    ServiceConfig.logger(`student(${s.id}) delete assignemnt(${assignId}) error!`);
                } else {
                    ServiceConfig.logger(`student(${s.id}) delete assignemnt(${assignId}) success!`)
                }
            }));
        }));
        // 删除附件
        const assignmentWithFile = await AssignmentModel.findFiles(assignId);
        await Promise.all(assignmentWithFile.files.map(async f => {
            fs.unlinkSync(f.link);
            await f.deleteOne();
        }));
        // 删除作业本身
        const result = await assignment.deleteOne();
        return true;
    } catch (error) {
        ServiceConfig.logger("deleteAssignment error:", error);
        return false;
    }
};


const updateAssignment = (_assignId: string): boolean => {
    return true;
};


export default {
    getAssignmentList,
    getAssignmentDetail,
    createNewAssignment,
    deleteAssignment,
    updateAssignment
};