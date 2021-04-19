import { Teacher } from "../model/teacher";

// 请求体对象类型
declare namespace User {
    // 创建新教师用户使用
    type NewTeacher = Omit<Teacher, "tId" | "classs" | "assignments" | "passwordHash"> & {password: string};
}

declare namespace Login {
    type User = {
        account: string,
        password: string,
        // 0 是教师 1 是学生
        type: 0 | 1
    };
}

declare namespace Assignment {

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