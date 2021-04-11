import { Router } from 'express';
import { API, NewTeacher } from '../../type';
import userService from '../services/userService';
import { checkResultCorrected, parseString } from '../utils/controllerUtils';

const teacherRouter = Router();

teacherRouter.post("/", async (req, res) => {
    const newTeacher = toNewTeacher(req.body);
    const result = await userService.createNewTeacher(newTeacher);
    checkResultCorrected(result);
    res.json(API.createEmptySucessResponse());
});


// teacherRouter.put("/:tid", async (req, res) => {
//     const updateTeacher = toUpdateTeacher(req.body);
// });


// const toUpdateTeacher = () => {
   
// };

/**
 * 请求参数校验
 */
type NewTeacherFields = { username: unknown, college: unknown, avator: unknown };
const toNewTeacher = ({ username, college, avator }: NewTeacherFields): NewTeacher => {
    const newTeacher: NewTeacher = {
        username: parseString(username, "username"),
        college: parseString(college, "college"),
        avator: parseString(avator, "avator")
    };
    return newTeacher;
};

export default teacherRouter;