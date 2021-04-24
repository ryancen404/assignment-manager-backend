import {Router} from 'express';
import { AuthorizationError } from '../other/customError';
import assignmentService from "../services/assignmentService";
import { isUserType } from './api.helper';

const assignmentRouter = Router();

/**
 * According to the token ID to find his asignment list
 */
assignmentRouter.get("/", async (req, res) => {
    // 对于Token中间件解出来的参数完全信任不做检验
    // 用户类型 0 1
    const userType = req.body.userType;
    if (!isUserType(userType)) {
        throw new AuthorizationError("token missing or invalid!");
    }
    // const userId = req.params["userId"];
    const userId = req.body.userId;
    const assignmentList = await assignmentService.getAssignmentList(userType, userId);

    if (assignmentList) {
        res.send(assignmentList);
    } else {
        res.sendStatus(404);
    }
});

assignmentRouter.get("/:assignId", (req, res) => {
    const assignment = assignmentService.getAssignmentDetail(req.params.assignId);
    if (assignment) {
        res.send(assignment);
    } else {
        res.sendStatus(404);
    }
});

/**
 * c
 */
assignmentRouter.post("/", (_req, _res) => {
    // const userId = req.body.userId;

    // const result = assignmentService.createNewAssignment(userId, );
});


export default assignmentRouter;