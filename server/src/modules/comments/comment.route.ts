import { Router } from "express";
import { authMiddleware, optionalAuthMiddleware } from "../../common/middlewares/auth.middleware";
import { validate } from "../../common/middlewares/validate.middleware";
import {
  createCommentController,
  deleteCommentController,
  getCommentsByArticleController,
  toggleCommentLikeController,
  pinCommentController,
} from "./comment.controller";
import {
  createCommentSchema,
  deleteCommentSchema,
  getCommentsByArticleSchema,
  likeCommentSchema,
  pinCommentSchema,
} from "./comment.schema";

const commentRouter = Router({ mergeParams: true });

commentRouter.get(
  "/",
  optionalAuthMiddleware,
  validate(getCommentsByArticleSchema),
  getCommentsByArticleController
);
commentRouter.post(
  "/",
  authMiddleware,
  validate(createCommentSchema),
  createCommentController
);
commentRouter.patch(
  "/pin",
  authMiddleware,
  validate(pinCommentSchema),
  pinCommentController
);
commentRouter.post(
  "/:commentId/like",
  authMiddleware,
  validate(likeCommentSchema),
  toggleCommentLikeController
);
commentRouter.delete(
  "/:commentId",
  authMiddleware,
  validate(deleteCommentSchema),
  deleteCommentController
);

export default commentRouter;