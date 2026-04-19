import { Router } from "express";
import {
  followUserController,
  getPublicProfileController,
  getPublicProfileArticlesController,
  unfollowUserController,
} from "./profile.controller";
import { getPublicProfileArticlesQuerySchema } from "./profile.schema";
import { authMiddleware, optionalAuthMiddleware } from "../../common/middlewares/auth.middleware";
import { validate } from "../../common/middlewares/validate.middleware";


const profileRouter = Router();

profileRouter.get("/:username", optionalAuthMiddleware, getPublicProfileController);
profileRouter.get(
  "/:username/articles",
  optionalAuthMiddleware,
  validate(getPublicProfileArticlesQuerySchema),
  getPublicProfileArticlesController
);
profileRouter.post("/:username/follow", authMiddleware, followUserController);
profileRouter.delete("/:username/follow", authMiddleware, unfollowUserController);

export default profileRouter;