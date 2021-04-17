// 请求体对象类型
import { Teacher } from '../../type';

declare namespace User {
    // 创建新教师用户使用
    type NewTeacher = Omit<Teacher, "tId" | "classs" | "assignments">;

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
