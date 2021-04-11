// 代码中自定义的实体类型
/**
 * @var tid: 所属的教师id
 */
export interface BaseAssignment {
    assignId: string,
    tid: string,
    assignName: string,
    description?: string,
}

export interface Assignment extends BaseAssignment {
    // 时间区间
    startTime: string,
    endTime: string,
    // 与作业关联的班级数组
    classs: BaseClass[],
    // 当前作业状态，以时间区间作为状态依据
    status: AssignmentStatus,
    // 是否已经被我(教师)批改, todo delete nullable
    corrected?: boolean,
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
 * @field status: 学生是否已经完成作业
 * @field scroe: 分数
 * @field corrected: 我(学生)作业是否已经被老师批改
 */
export interface StudentAssignment extends BaseAssignment, ClassStudent {
    status: boolean,
    corrected: boolean
    score: number,
}


/**
 * 教师用户
 */
export interface Teacher {
    tId: number,
    username: string,
    college: string,
    // 头像链接
    avator?: string,
    // class对象的id数组
    classs: string[],
    // assignment的 id数组
    assignments: string[]
}

// 创建新教师用户使用
type BaseTeacher = Omit<Teacher, "tId" | "classs" | "assignments">;

/**
 * 学生端用户
 */
export interface StudentUser {
    username: string,
    avator: string,
    studentNumber: string,
}

export declare namespace API {
    // 自定义请求结果

    type statusCode = 0 | 1;

    export interface BaseResponse {
        statusCode: statusCode,
        message?: string,
        content?: unknown,
    }
}