import { Assignment, Class, User } from "../controller/request.type";
import AssignmentModel, { Assignment as AssignmentDB } from '../model/assignment.model';
import fs from 'fs';
import AssignmentFileModel, { AssignmentFile } from "../model/assignmentFile.model";
import StudentModel from "../model/student.model";
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
    try {
        const myself = await TeacherModel.findById(userId);
        if (myself === null) {
            throw new ParamError("user is error!")
        }
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
        const classesDB = await Promise.all(assignment.classIds.map(async id => await ClassModel.findById(id)));
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
        myself.assignments.addToSet(savedAssign._id);
        const result = await myself.updateOne({ assignments: myself.assignments }).exec();
        ServiceConfig.logger("createNewAssignment success! id=", savedAssign.id);
        return savedAssign._id !== undefined && result.ok === 1;
    } catch (error) {
        ServiceConfig.logger("createNewAssignment error:", error);
        return false;
    }
};

/**
 * 删除assignment
 */
const deleteAssignment = (_assignId: string): boolean => {
    return true;
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