export interface BaseAssignment {
    assignId: string,
    assignName: string,
    description?: string,
}

export interface Assignment extends BaseAssignment {
    // 时间区间
    timeFromTo: string,
    // 与作业关联的班级数组
    classs: BaseClass[],
    // 当前作业状态，以时间区间作为状态依据
    status: AssignmentStatus,
    // 附件列表
    files?: AssignmentFile[]
}

export type AssignmentStatus = '未开始' | '进行中' | '已结束';

/**
 * 作业附件对象，md5用作校验
 */
export interface AssignmentFile {
    name: string,
    link: string,
    md5: string,
    length: number
}


/**
 * 班级实体
 * 在浏览页和详情页表头使用
 * @param classId 班级唯一标识
 * @param className 班级名
 * @param className 班级号
 */
export interface BaseClass {
    classId: string,
    className: string,
    classNumber: string
}

/**
 * 在详情页的学生列表对象中使用，其中学生信息包含作业完成情况
 * @param students 班级学生
 */
export interface DetailClass extends BaseClass {
    studentsAssignment: StudentAssignment[]
}

/**
 * 班级的学生信息
 */
export interface ClassStudent {
    sId: number,
    // 学号
    studentNumber: string,
    // 学生姓名
    studentName: string,
    // 班级名
    className: string,
    // 班级号
    classNumber: string
}

/**
 * Student作业完成情况类型
 * @field scroe: 分数
 */
export interface StudentAssignment extends BaseAssignment, ClassStudent {
    status: AssignmentComplete,
    score: number,
}

export type AssignmentComplete = "已完成" | "未完成";
