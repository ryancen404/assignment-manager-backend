import { Assignment } from "../model/assignment.model";
import { Classs } from "../model/classs.model";
import { Student } from "../model/student.model";
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
    export type NewAssignment = Omit<Assignment, "">;
}

declare namespace Class {

    export interface ResBaseClass extends Classs {
        classId: string,
        // students objectids
        students: Array<string>
    }

    export interface ResBrowseClass extends ResBaseClass {
        students: Array<Omit<Student.ResBaseStudent, "teacher">>,
    }

}

declare namespace Student {
    // 返回的Student类型
    export interface ResBaseStudent extends Student {
        sid: string,
        // class的ObjectId
        classId: string,
        // teacher objectIds 
        teacher?: Array<string>,
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