import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ParamError } from '../other/custom.error';
import teacherService from '../services/teacher.service';
import { createSucessResponse, parseNumber, parseString } from '../other/api.helper';
import { API, Login } from './request.type';
import config from '../config/env.config';
import RouterConfig from '../config/router.config';
import StudentService from '../services/student.service';

const loginRouter = Router();
RouterConfig.addPathToNoTokenChecks("login");

/**
 * 处理过程中直接抛出异常会被errorHandle中间件统一处理
 */
loginRouter.post("/", async (req, res) => {
  const loginParams = toLoginParams(req.body);
  if (loginParams.type == 0) {
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
    const response = {
      token,
      username: teacher.username,
      uid: teacher.id,
      type: 0
    }
    res.status(200).json(createSucessResponse({ ...response }));
  } else {
    const student = await StudentService.getStudentByStuNumber(loginParams.account);
    if (student === null) {
      throw new ParamError("账号不存在");
    }
    const passwordCorrrect = await bcrypt.compare(loginParams.password, student.passwordHash);
    if (!passwordCorrrect) {
      throw new ParamError("密码错误!");
    }
    const userForToken: API.UserToken = {
      account: student.studentNumber,
      id: student.id,
      type: 1
    };
    const token = jwt.sign(userForToken, config.TOKEN_SECRET);
    const response = {
      token,
      username: student.studentName,
      uid: student.id,
      type: 1
    }
    res.status(200).json(createSucessResponse({ ...response }));
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
  const n = parseNumber(type, "type");
  if (n !== 0 && n !== 1) {
    throw new ParamError("login params type is malformatted");
  }
  return n;
};

export default loginRouter;