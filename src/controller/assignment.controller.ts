import { Router } from 'express';
import { AuthorizationError, ParamError } from '../other/custom.error';
import assignmentService from "../services/assignment.service";
import { createEmptySucessResponse, createFailResponse, createSucessResponse, isUserType, paraseArray, parseNumber, parseString } from '../other/api.helper';
import { Assignment } from './request.type';
import FilesService from '../services/files.service';

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
    const userId = req.body.userId;
    const assignmentList = await assignmentService.getAssignmentList(userType, userId);
    
    if (assignmentList) {
        res.status(200).json(createSucessResponse(assignmentList));
    } else {
        res.status(200).json(createSucessResponse([]));
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


assignmentRouter.post("/", async (req, res) => {
    const userId = req.body.userId;
    const newAssignment = toNewAssignment(req.body);
    const moveResult = await FilesService.moveAssignmentAttach(userId, newAssignment.filesName);
    if (!moveResult) {
        res.status(200).json(createFailResponse("filesName maybe error!"))
        return
    }
    const storageResult = await assignmentService.createNewAssignment(userId, newAssignment);
    if (storageResult) {
        res.status(200).json(createEmptySucessResponse());
    } else {
        res.status(500).json(createFailResponse("server handle error!"));
    }
});


type NewAssignmentField = {
    name: unknown,
    desc: unknown,
    classIds: unknown,
    filesName: unknown,
    startTime: unknown,
    endTime: unknown
}
const toNewAssignment = ({ name, desc, classIds, filesName, startTime, endTime }: NewAssignmentField) => {
    const newAssignment: Assignment.reqNewAssignment = {
        name: parseString(name, "assignmentName"),
        desc: parseString(desc, "assignmentDesc"),
        classIds: paraseArray(classIds, "classIds"),
        filesName: paraseArray(filesName, "filesName"),
        startTime: parseNumber(startTime, "assignment startTime"),
        endTime: parseNumber(endTime, "assignment end time")
    }
    if (newAssignment.startTime > newAssignment.endTime) {
        throw new ParamError("time format error!");
    }
    return newAssignment
}


export default assignmentRouter;