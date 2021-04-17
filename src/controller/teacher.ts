import { Router } from 'express';
import { User } from './requestType';
import userService from '../services/teacherService';
import { checkResultCorrected, createEmptySucessResponse, parseString } from '../utils/APIUtils';

const teacherRouter = Router();

// 创建教师用户
teacherRouter.post("/", async (req, res) => {
    const newTeacher = toNewTeacher(req.body);
    const result = await userService.createNewTeacher(newTeacher);
    checkResultCorrected(result);
    res.json(createEmptySucessResponse());
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
type newTeacherField = { username: unknown, college: unknown, avator: unknown };

const toNewTeacher = ({ username, college, avator }: newTeacherField): User.NewTeacher => {
    const newTeacher: User.NewTeacher = {
        username: parseString(username, "username"),
        college: parseString(college, "college"),
        avator: parseString(avator, "avator")
    };
    return newTeacher;
};


export default teacherRouter;