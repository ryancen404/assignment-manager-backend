import { Router, Request } from "express";
import multer from 'multer';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import RouterConfig from "../config/router.config";
import FilesService from "../services/files.service";
import EnvConfig from "../config/env.config";
import { API } from "./request.type";
import MiddlewareConfig from "../config/middleware.config";
import { AuthorizationError, ParamError } from "../other/custom.error";
import { createSucessResponse } from "../other/api.helper";
import AssignmentFileModel from "../model/assignmentFile.model";

const fileRouter = Router();
RouterConfig.addPathToNoTokenChecks("studentTemplate");
const studentStoragePath = "./.data/temp/import/";
const studentInfoUploader = multer({ dest: studentStoragePath });
const attachmentStoragePath = "./.data/temp/attachment/"
const attachmentUploader = multer({ dest: attachmentStoragePath });
const studentAssignment = "./.data/temp/assignment/stu"
const stuUploader = multer({ dest: studentAssignment })

// 学生信息导入模版下载
fileRouter.get('/studentTemplate', (_req, res) => {
  res.status(200).download('./resource/template/学生模版.xlsx');
});

// 学生信息导入
fileRouter.post('/studentImport', studentInfoUploader.single('StuentImportToBackendFileName'), async (req, res) => {
  const userId = getUserId(req);
  const result = await FilesService.handleStudentImport(userId, req.file);
  if (result) {
    res.status(200).send("upload success!");
  } else {
    res.status(500).send("upload error!")
  }
});

fileRouter.post('/assignment/attachment', attachmentUploader.single('tempAttachment'), async (req, res) => {
  const userId = getUserId(req);
  const result = await FilesService.moveAttachment(userId, req.file);
  if (result !== null) {
    res.status(200).json(createSucessResponse(result));
  } else {
    res.status(500).send("upload error!")
  }
});

fileRouter.post('/assignment/stu', stuUploader.single("stuAssignFile"), async (req, res) => {
  const userId = getUserId(req);
  const result = await FilesService.savedStuFileToDb(userId, req.file);
  if (result !== null && result !== "") {
    res.status(200).json(createSucessResponse(result));
  } else {
    res.status(500).send("upload error!")
  }
})

// 下载作业中的附件
fileRouter.get('/assignment/attachment/:fId', async (req, res) => {
  const fId = req.params["fId"]
  const fileDB = await AssignmentFileModel.findById(fId);
  if (fileDB == null) {
    throw new ParamError("fid error!")
  }
  res.status(200).download(fileDB.link!);
});

// 下载学生自己完成的作业
fileRouter.get('/assignment/student/:fId', async (req, res) => {
  const fId = req.params["fId"]
  const fileDB = await AssignmentFileModel.findById(fId);
  if (fileDB == null) {
    throw new ParamError("fid error!")
  }
  res.status(200).download(fileDB.link!);
});

/**
 * 使用了multer之后把body清空了，这里重新获取一次token中的userid
 * @returns 上传者的教师ID
 */
const getUserId = (request: Request) => {
  const token = request.get('Authorization');
  if (token !== undefined) {
    try {
      const decodeUserToken = jwt.verify(token, EnvConfig.TOKEN_SECRET);
      if (isUserToken(decodeUserToken)) {
        // 注意不要覆盖
        return decodeUserToken.id
      }
      throw new AuthorizationError("token missing or invalid!");
    } catch (error) {
      MiddlewareConfig.logger("token check error, maybe is JsonWebTokenError. Detail:", error);
      throw new AuthorizationError("token missing or invalid!");
    }
  } else {
    throw new AuthorizationError("token missing or invalid!");
  }
}

const isUserToken = (object: any): object is API.UserToken => {
  return "account" in object && "id" in object && "type" in object;
};

export default fileRouter;