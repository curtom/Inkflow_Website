import {Router} from "express";
import {authMiddleware} from "../../common/middlewares/auth.middleware";
import {getCurrentUserProfileController, updateCurrentUserProfileController} from "./user.controller";
import {validate} from "../../common/middlewares/validate.middleware";
import {updateCurrentUserSchema} from "./user.schema";


const userRouter = Router();

userRouter.get("/me", authMiddleware, getCurrentUserProfileController);
userRouter.patch("/me", authMiddleware, validate(updateCurrentUserSchema), updateCurrentUserProfileController);

export default userRouter;