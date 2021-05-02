import { Router } from "express";
import RouterConfig from "../config/router.config";

const signupRouter = Router();
RouterConfig.addPathToNoTokenChecks("signup");

signupRouter.post("/", async (req, res) => {

})

export default signupRouter;