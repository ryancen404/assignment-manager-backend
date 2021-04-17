import { Router } from 'express';
import { ParamError } from '../other/customError';
import teacherService from '../services/teacherService';
import { parseNumber, parseString } from '../utils/APIUtils';
import { Login } from './requestType';

const loginRouter = Router();

loginRouter.post("/", async (req, res) => {
  const loginParams = toLoginParams(req.body);
  if (loginParams.type == 1) {
    const result = await teacherService.getTeacher(loginParams);

  } else {
    const reuslt = await studentService.getStudent(loginParams);
  }
});

type LoginField = { account: unknown, password: unknown, type: unknown };

const toLoginParams = ({ account, password, type }: LoginField): Login.User => {
  const loginParams: Login.User = {
    account: parseString(account, "account"),
    password: parseString(password, "password"),
    type: parseLoginType(type)
  };
  return loginParams;
};

const parseLoginType = (type: unknown) => {
  const n = parseNumber(type);
  if (n !== 0 && n !== 1) {
    throw new ParamError("login params type is malformatted");
  }
  return n;
};

export default loginRouter;