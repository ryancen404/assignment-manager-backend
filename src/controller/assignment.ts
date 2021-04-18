import {Router} from 'express';
import assignmentService from "../services/assignmentService";

const assignmentRouter = Router();

/**
 * According to the teacher's ID to find his asignment list
 * @router tid teacher's ID
 */
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

/**
 * c
 */
// assignmentRouter.post("/", (_req, res) => {
    // const result = assignmentService.createNewAssignment();
// });


export default assignmentRouter;