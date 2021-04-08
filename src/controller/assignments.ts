import {Router} from 'express';
import assignmentService from "../services/assignmentService";
import { resultNotNullHandle } from '../utils/controllerUtils';

const assignmentRouter = Router();

assignmentRouter.get("/:tid", (req, res) => {
    const assignmentList = assignmentService.getAssignmentList(req.params.tid);
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

assignmentRouter.post("/", (req, res) => {
    const result = assignmentService.createNewAssignment();
    resultNotNullHandle(result, res);
});


export default assignmentRouter;