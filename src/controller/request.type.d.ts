import { Assignment, AssignmentStatus } from "../model/assignment.model";
import { AssignmentFile } from "../model/assignmentFile.model";
import { Classs } from "../model/classs.model";
import { Student, StudentAssignment } from "../model/student.model";
import { Teacher } from "../model/teacher.model";

// 请求体对象类型
declare namespace User {
    // 创建新教师用户使用
    type NewTeacher = Omit<Teacher, "tId" | "classs" | "assignments" | "passwordHash"> & { password: string };

    // 0 是教师 1 是学生
    type Type = 0 | 1;
}

declare namespace Login {
    type User = {
        account: string,
        password: string,
        type: User.Type
    };
}

declare namespace Assignment {
    export interface reqNewAssignment {
        name: string,
        desc?: string,
        classIds: string[],
        startTime: number,
        endTime: number,
        filesName?: string[]
    }

    export interface ResEasyAssignment extends Omit<Assignment, "class" | "files"> {
        assignId: string,
        startTime: string,
        endTime: string,
        classs: Class.ResBaseClass[],
        files?: ResAssignmentFile[],
        description?: string
    }

    export interface ResAssignmentFile extends AssignmentFile {
        fileId: string
    }
}

declare namespace Class {

    export interface ResBaseClass extends Classs {
        classId: string,
        // students objectids
        students?: Array<string>
    }

    export interface ResBrowseClass extends ResBaseClass {
        students: Array<Omit<Student.ResBaseStudent, "teacher">>,
    }

    export interface ResDeatilClass extends ResBaseClass {
        students: Student.ResStudentWithOneAssign[]
    }

}

declare namespace Student {
    // 返回的Student类型
    export interface ResBaseStudent extends Omit<Student, "passwordHash"> {
        sId: string,
        // class的ObjectId
        classId: string,
        // teacher objectIds 
        teacher?: Array<string>,
    }

    // 改assignment为assignId
    export interface ResStudentAssignment extends Omit<StudentAssignment, "assignment"> {
        assignId: string,
        myFile?: Assignment.ResAssignmentFile,
    }

    export type ResStudentWithOneAssign = Omit<ResBaseStudent, "assignments" | "passwordHash"> & ResStudentAssignment

    export type ResStudentAssignmentDeatil = Omit<StudentAssignment, "assignment" | "files"> & {
        assignId: string,
        assignName: string,
        tId: string,
        teacherName: string,
        startTime: string,
        endTime: string,
        files?: Assignment.ResAssignmentFile[],
        description?: string,
        status: AssignmentStatus,
        myFiles: Assignment.ResAssignmentFile[],
    }
}


export declare namespace API {
    // 自定义请求结果

    type Code = 0 | 1;

    export interface BaseResponse {
        code: Code,
        message?: string,
        content?: unknown,
    }

    // 账号和该用户的唯一id
    export interface UserToken {
        account: string,
        id: string,
        type: 0 | 1
    }
}