import { Assignment } from "../../type";

/**
 * 通过教师端id获取所属的作业Preview列表
 * 其中的class filed不包含学生数组
 * @param tid 教师用户id
 * @returns 
 */
const getAssignmentList = (_tid: string): Assignment[] | null => {
    return null;
};

/**
 * 根据assignId返回完整的作业详情信息
 * @param assignId 作业唯一id
 * @return 找不到会为空
 */
const getAssignmentDetail = (_assignId: string): Assignment | null  => {
    return null;
};

/**
 * create new Assignment
 * 
 * @returns is succeed add to db
 */
const createNewAssignment = (): boolean => {
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