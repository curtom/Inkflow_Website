import { Router } from 'express';
import {
    getCurrentUserController,
    loginController,
    registerController,
} from "./auth.controller";
import { validate } from "../../common/middlewares/validate.middleware";
import { loginSchema, registerSchema } from "./auth.schema";
import { authMiddleware } from "../../common/middlewares/auth.middleware";

const authRouter = Router();

authRouter.post("/register", validate(registerSchema), registerController);
authRouter.post("/login", validate(loginSchema), loginController);
authRouter.get("/me",authMiddleware,getCurrentUserController);

export default authRouter;