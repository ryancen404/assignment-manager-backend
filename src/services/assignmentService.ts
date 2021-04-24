import { User } from "../controller/request.type";
import StudentModel from "../model/student";
import TeacherModel from "../model/teacher";

/**
 * 根据用户类型和id来找到作业数组
 * @returns 
 */
const getAssignmentList = async (userType: User.Type, userId: string) => {
    if (userType === 0) {
        const teacherAssignments = await TeacherModel.findAssignments(userId);
        return teacherAssignments.assignments;
    } else {
        const studentAssignments = await StudentModel.findMyAssignments(userId);
        return studentAssignments.assignments;
    }
};

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
 * 
 * @returns is succeed add to db
 */
const createNewAssignment = (): boolean => {
    // const newAssignment: Assignment = {
    //     teacher: 
    // }
    return true;
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