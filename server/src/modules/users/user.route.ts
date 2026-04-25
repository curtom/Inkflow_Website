import {Router} from "express";
import {authMiddleware} from "../../common/middlewares/auth.middleware";
import {getCurrentUserProfileController, updateCurrentUserProfileController} from "./user.controller";
import {validate} from "../../common/middlewares/validate.middleware";
import {updateCurrentUserSchema, profilePinnedArticleSchema} from "./user.schema";
import {
  getMyArticlesController,
  getMyFavoriteArticlesController,
  patchProfilePinnedArticleController,
} from "./user-article.controller";

const userRouter = Router();

userRouter.get("/me", authMiddleware, getCurrentUserProfileController);
userRouter.patch("/me", authMiddleware, validate(updateCurrentUserSchema), updateCurrentUserProfileController);
userRouter.get("/me/articles", authMiddleware, getMyArticlesController);
userRouter.get("/me/favorites", authMiddleware, getMyFavoriteArticlesController);
userRouter.patch(
  "/me/profile-pinned-article",
  authMiddleware,
  validate(profilePinnedArticleSchema),
  patchProfilePinnedArticleController
);

export default userRouter;