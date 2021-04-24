import { Router } from "express";
import ControllerConfig from "./config.controller";

const signupRouter = Router();
ControllerConfig.addPathToNoTokenChecks("signup");

signupRouter.post("/", async (req, res) => {

})

export default signupRouter;