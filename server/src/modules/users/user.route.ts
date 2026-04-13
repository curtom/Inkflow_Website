import {Router} from "express";
import {authMiddleware} from "../../common/middlewares/auth.middleware";
import {getCurrentUserProfileController, updateCurrentUserProfileController} from "./user.controller";
import {validate} from "../../common/middlewares/validate.middleware";
import {updateCurrentUserSchema} from "./user.schema";
import { getMyArticlesController, getMyFavoriteArticlesController } from "./user-article.controller";

const userRouter = Router();

userRouter.get("/me", authMiddleware, getCurrentUserProfileController);
userRouter.patch("/me", authMiddleware, validate(updateCurrentUserSchema), updateCurrentUserProfileController);
userRouter.get("/me/articles", authMiddleware, getMyArticlesController);
userRouter.get("/me/favorites", authMiddleware, getMyFavoriteArticlesController);

export default userRouter;