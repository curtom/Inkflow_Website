import { Router } from "express";
import { authMiddleware } from "../../common/middlewares/auth.middleware";
import {
  toggleFavoriteArticleController,
  toggleLikeArticleController,
} from "./reaction.controller";

const reactionRouter = Router({ mergeParams: true });

reactionRouter.post("/like", authMiddleware, toggleLikeArticleController);
reactionRouter.post("/favorite", authMiddleware, toggleFavoriteArticleController);

export default reactionRouter;