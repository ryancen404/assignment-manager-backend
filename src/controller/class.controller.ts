import { Router } from 'express';
import { ParamError } from '../other/custom.error';
import classService from '../services/class.service';
import { createEmptySucessResponse, createFailResponse, createSucessResponse } from '../other/api.helper';

const classRouter = Router();

// 教师获取全部班级信息
classRouter.get("/all", async (req, res) => {
  const userId = req.body.userId;
  const userType = req.body.userType;
  if (userType != 0) {
    throw new ParamError("only teacher user can get all classs");
  }
  const myClass = await classService.getTeacherClass(userId);
  res.status(200).json(createSucessResponse(myClass));
});

classRouter.get("/easy", async (req, res) => {
  const userId = req.body.userId;
  const userType = req.body.userType;
  if (userType != 0) {
    throw new ParamError("only teacher user can get all classs");
  }
  const myBaseClass = await classService.getTeacherBaseClass(userId);
  res.status(200).json(createSucessResponse(myBaseClass));
})

classRouter.post("/:classId", async (req, res) => {
  const result = await classService.deleteClassStudent(req.params.classId, req.body.sId);
  if (!result) {
    res.status(200).json(createFailResponse("classId or sId non-existent"));
  } else {
    res.status(200).json(createEmptySucessResponse());
  }
});




export default classRouter;