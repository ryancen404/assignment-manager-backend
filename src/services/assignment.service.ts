import { Assignment, Class, Student, User } from "../controller/request.type";
import AssignmentModel, { Assignment as AssignmentDB } from '../model/assignment.model';
import fs from 'fs';
import AssignmentFileModel, { AssignmentFile } from "../model/assignmentFile.model";
import StudentModel, { StudentAssignment, StudentPopulateAssignDocument } from "../model/student.model";
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
        const assignmentList = await toResStuEasyAssignment(studentAssignments);
        return assignmentList;
    }
};

const toResStuEasyAssignment = async (stuAssignment: StudentPopulateAssignDocument): Promise<Student.ResStudentAssignmentDeatil[]> => {
    const assignments = stuAssignment.assignments;
    const result: Student.ResStudentAssignmentDeatil[] = [];
    for (let index in assignments) {
        const stuAssignment = assignments[index];
        const assignment = await AssignmentModel.findById(stuAssignment.assignment).populate("teacher").exec();
        if (assignment === null) {
            continue;
        }
        // 作业附件
        const assignmentWithFile = await AssignmentModel.findFiles(assignment.id);
        const files: Assignment.ResAssignmentFile[] = assignmentWithFile.files.map(f => {
            const file: Assignment.ResAssignmentFile = {
                name: f.name,
                fileId: f.id,
                length: f.length,
                link: f.link
            };
            return file;
        });
        // 学生完成的作业信息
        const myFiles: Assignment.ResAssignmentFile[] = []
        for (let i in stuAssignment.files) {
            const fileId = stuAssignment.files[Number(i)];
            const fileDB = await AssignmentFileModel.findById(fileId);
            if (fileDB === null) {
                continue
            }
            const file: Assignment.ResAssignmentFile = {
                name: fileDB.name,
                fileId: fileDB.id,
                length: fileDB.length,
                link: fileDB.link
            };
            myFiles.push(file);
        }

        const stuAssign: Student.ResStudentAssignmentDeatil = {
            assignId: assignment.id,
            corrected: stuAssignment.corrected,
            assignmentStatus: stuAssignment.assignmentStatus,
            score: stuAssignment.score,
            assignName: assignment.assignName,
            teacherName: assignment.teacher.username,
            status: assignment.status,
            tId: assignment.teacher.id,
            startTime: assignment.startTime.toLocaleDateString(),
            endTime: assignment.endTime.toLocaleDateString(),
            files,
            description: assignment.desc,
            myFiles
        }
        result.push(stuAssign);
    }
    return result;
}

// 转为返回所需要的类型
const toResEasyAssignment = async (teacher: TeacherDocument) => {
    const result = await Promise.all(teacher.assignments.map(async assignId => {
        const assignmentWithClass = await AssignmentModel.findClass(assignId);
        const assignmentWithFiles = await AssignmentModel.findFiles(assignId);
        const classes: Class.ResBaseClass[] = assignmentWithClass.class.map(clazz => {
            const resClazz: Class.ResBaseClass = {
                classId: clazz.id,
                className: clazz.className,
                classNumber: clazz.classNumber
            }
            return resClazz;
        })
        const files: Assignment.ResAssignmentFile[] = assignmentWithFiles.files.map(f => {
            const file: Assignment.ResAssignmentFile = {
                name: f.name,
                fileId: f.id,
                length: f.length,
                link: f.link
            };
            return file;
        })
        const resAssignment: Assignment.ResEasyAssignment = {
            assignId,
            assignName: assignmentWithClass.assignName,
            description: assignmentWithClass.desc,
            startTime: assignmentWithClass.startTime.toLocaleDateString(),
            endTime: assignmentWithClass.endTime.toLocaleDateString(),
            corrected: assignmentWithClass.corrected,
            status: assignmentWithClass.status,
            teacher: teacher.id,
            classs: classes,
            total: assignmentWithClass.total,
            complete: assignmentWithClass.complete,
            files
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
const getAssignmentClasses = async (assignId: string) => {
    try {
        const assignmentDB = await AssignmentModel.findById(assignId);
        if (assignmentDB === null) {
            return null;
        }
        const classes: Class.ResDeatilClass[] = []
        for (let clazzIndex in assignmentDB.class) {
            const clazzId = assignmentDB.class[clazzIndex];
            const classWithStudents = await ClassModel.findMyStudents(clazzId);
            const students: Student.ResStudentWithOneAssign[] = [];

            for (let sIndex in classWithStudents.students) {
                const s = classWithStudents.students[sIndex];
                const thisAssignment = s.assignments.find(a => a.assignment.equals(assignId));
                if (thisAssignment === undefined) {
                    throw new ParamError("the assignId is error!");
                }
                let myFile: Assignment.ResAssignmentFile | undefined = undefined;
                if (thisAssignment.files !== undefined) {
                    const fId = thisAssignment.files[0]
                    const fileDB = await AssignmentFileModel.findById(fId);
                    if (fileDB !== null) {
                        myFile = {
                            name: fileDB.name,
                            link: fileDB.link,
                            fileId: fileDB.id,
                            length: fileDB.length
                        }
                    }
                }
                const student: Student.ResStudentWithOneAssign = {
                    sId: s.id,
                    studentName: s.studentName,
                    studentNumber: s.studentNumber,
                    classId: classWithStudents.id,
                    grade: s.grade,

                    assignId: assignId,
                    assignmentStatus: thisAssignment.assignmentStatus,
                    corrected: thisAssignment.corrected,
                    score: thisAssignment.score,
                    myFile
                }
                students.push(student);
            }
            const detailClass: Class.ResDeatilClass = {
                classId: clazzId,
                className: classWithStudents.className,
                classNumber: classWithStudents.classNumber,
                students
            }
            classes.push(detailClass);
        }
        ServiceConfig.logger("getAssignmentClasses success, length:", classes.length)
        return classes;
    } catch (error) {
        ServiceConfig.logger("getAssignmentClasses error: ", error);
        return null
    }
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
            complete: 0,
            desc: assignment.desc,
            status: "未开始"
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
            if (clazzDB === null) {
                return
            }
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
            if (f.link === undefined) {
                return
            }
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

/**
 * 更新分数并且设置为已经批改
 * 嵌套类型需要调用整个对象的update
 */
const updateAssignmentScore = async (assignId: string, sId: string, score: number) => {
    try {
        const studentWithAssignments = await StudentModel.findMyAssignments(sId);
        const newAssignments = studentWithAssignments.assignments.map(a => {
            if (a.assignment.equals(assignId)) {
                a.score = score;
                a.corrected = true
            }
            return a;
        })
        const updateResult = await studentWithAssignments.updateOne({ assignments: newAssignments }).exec();
        ServiceConfig.logger(`studnet ${sId} update Assignment(${assignId}) Score(${score}) success`);
        return updateResult.ok === 1;
    } catch (error) {
        ServiceConfig.logger("updateAssignmentScore error:", error);
        return false
    }
};

const completeAssignemnt = async (userId: string, assignId: string) => {
    const assignment = await AssignmentModel.findClass(assignId);
    if (assignment === null) {
        throw new ParamError("assignment id is error!");
    }
    try {
        const updateAssignRes = await assignment.updateOne({ corrected: true, status: "已结束", complete: assignment.total }).exec()
        ServiceConfig.logger("completeAssignemnt", `update assignment(${assignId})`, updateAssignRes);
        if (updateAssignRes.ok !== 1) {
            return false;
        }
        for (let i in assignment.class) {
            const clazz = assignment.class[i];
            for (let j in clazz.students) {
                const sId = clazz.students[j];
                const studentDB = await StudentModel.findMyAssignments(sId);
                const newAssigns = studentDB.assignments.map(a => {
                    if (a.assignment.equals(assignId)) {
                        a.corrected = true;
                        a.assignmentStatus = true;
                    }
                    return a;
                })
                const updteRes2 = await studentDB.updateOne({ assignments: newAssigns }).exec();
                if (updteRes2.ok !== 1) {
                    return false;
                }
                ServiceConfig.logger("completeAssignemnt", `update student(${sId})`, updteRes2);
            }
        }
        return true
    } catch (error) {
        ServiceConfig.logger("completeAssignemnt error", error);
        return false
    }
}

const stuCompleteAssignment = async (userId: string, assignId: string, fileId: string) => {

    const studentWithAssign = await StudentModel.findMyAssignments(userId);
    const theStuAssignment = studentWithAssign.assignments.find(a => a.assignment.equals(assignId));
    if (theStuAssignment === undefined) {
        return false
    }
    const theAssignment = await AssignmentModel.findById(theStuAssignment.id);
    if (theAssignment == null) {
        return false;
    }
    let isModify = false;
    if (theStuAssignment.files !== undefined && theStuAssignment.files.length > 0) {
        isModify = true;
    }
    const newFilesId = [Types.ObjectId(fileId)];
    const newAssignment: StudentAssignment = {
        assignment: theStuAssignment.assignment,
        assignmentStatus: true,
        files: newFilesId,
        corrected: false,
        score: 0
    }
    const newAssignments = studentWithAssign.assignments.map(a => {
        if (a.assignment.equals(newAssignment.assignment)) {
            return newAssignment
        }
        return a;
    })
    const updateRes = await studentWithAssign.updateOne({ assignments: newAssignments }).exec();
    ServiceConfig.logger("stuCompleteAssignment stu updateRes: ", updateRes);
    if (!isModify) {
        const updateRes2 = await theAssignment.updateOne({ complete: theAssignment.complete + 1 }).exec();
        ServiceConfig.logger("stuCompleteAssignment assignemnt updateRes: ", updateRes2);
    }
    return updateRes.ok === 1;
}


export default {
    getAssignmentList,
    getAssignmentClasses,
    createNewAssignment,
    deleteAssignment,
    updateAssignmentScore,
    completeAssignemnt,
    stuCompleteAssignment
};