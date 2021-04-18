import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ParamError } from '../other/customError';
import teacherService from '../services/teacherService';
import { createSucessResponse, parseNumber, parseString } from '../utils/APIUtils';
import { API, Login } from './requestType';
import config from '../utils/config';

const loginRouter = Router();

/**
 * 处理过程中直接抛出异常会被errorHandle中间件统一处理
 */
loginRouter.post("/", async (req, res) => {
  const loginParams = toLoginParams(req.body);
  if (loginParams.type == 1) {
    const teacher = await teacherService.getTeacherByAccount(loginParams.account);
    if (teacher == null) {
      throw new ParamError("账号不存在!");
    }
    const passwordCorrrect = await bcrypt.compare(loginParams.password, teacher.passwordHash);
    if (!passwordCorrrect) {
      throw new ParamError("密码错误!");
    }
    // 如果都正确返回token, token由 用户的id、用户名和私钥加密
    const userForToken: API.UserToken = {
      account: teacher.account,
      id: teacher.id,
      type: 0
    };
    const token = jwt.sign(userForToken, config.TOKEN_SECRET);
    res.status(200).json(createSucessResponse(token));
  } else {
    // const reuslt = await studentService.getStudent(loginParams);
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