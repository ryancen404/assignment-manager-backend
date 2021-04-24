import { Router } from "express";
import ControllerConfig from "./config.controller";

const fileRouter = Router();
ControllerConfig.addPathToNoTokenChecks("studentTemplate");

// 信息导入模版
fileRouter.get('/studentTemplate', (req, res) => {
  res.download('./resource/template/import_template.xlsx');
})

export default fileRouter;