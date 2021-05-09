import { Router } from 'express';
import { User } from './request.type';
import userService from '../services/teacher.service';
import { checkResultCorrected, createEmptySucessResponse, parseString } from '../other/api.helper';
import RouterConfig from '../config/router.config';

const teacherRouter = Router();
RouterConfig.addPathToNoTokenChecks("user/teacher'");

// 创建教师用户
teacherRouter.post("/signup", async (req, res) => {
    const newTeacher = toNewTeacher(req.body);
    const result = await userService.createNewTeacher(newTeacher);
    checkResultCorrected(result);
    res.status(200).json(createEmptySucessResponse());
});

/**
 * 更新teacher信息
 * 到时候是通过信息导入的方式新增班级和学生信息的
 */
// teacherRouter.put("/:tid", async (req, res) => {
//     const updateTeacher = toUpdateTeacher(req.body);
// });


/**
 * 请求参数校验
 */
type NewTeacherField = {
    account: unknown,
    password: unknown,
    username: unknown,
    college: unknown,
};
const toNewTeacher = ({ account, password, username, college }: NewTeacherField): User.NewTeacher => {
    const newTeacher: User.NewTeacher = {
        account: parseString(account, "account"),
        password: parseString(password, "passowrd"),
        username: parseString(username, "username"),
        college: parseString(college, "college"),
    };
    return newTeacher;
};


export default teacherRouter;