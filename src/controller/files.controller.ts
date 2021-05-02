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
import { AuthorizationError } from "../other/custom.error";

const fileRouter = Router();
RouterConfig.addPathToNoTokenChecks("studentTemplate");
const storagePath = "./.data/temp/import/";
const upload = multer({ dest: storagePath })

// 信息导入模版下载
fileRouter.get('/studentTemplate', (_req, res) => {
  res.status(200).download('./resource/template/import_template.xlsx');
});

// 信息导入
fileRouter.post('/studentImport', upload.single('StuentImportToBackendFileName'), async (req, res) => {
  const userId = getUserId(req);
  const result = await FilesService.handleStudentImport(userId, req.file);
  if (result) {
    res.status(200).send("upload success!");
  } else {
    res.status(500).send("upload error!")
  }
});

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