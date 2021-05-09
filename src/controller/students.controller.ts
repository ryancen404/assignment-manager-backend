import { Router } from "express";
import RouterConfig from "../config/router.config";

const studentRouter = Router();
RouterConfig.addPathToNoTokenChecks("student/signup'");

studentRouter.post("/signup", async (req, res) => {
  
})

/**
 * 教师获取学生作业内容, todo
 */
studentRouter.post("/assignment/file", async (req, res) => {
  
})

export default studentRouter;