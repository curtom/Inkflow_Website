import { Router } from "express";
import { authMiddleware } from "../../common/middlewares/auth.middleware";
import { validate } from "../../common/middlewares/validate.middleware";
import {
  createCommentController,
  deleteCommentController,
  getCommentsByArticleController,
} from "./comment.controller";
import {
  createCommentSchema,
  deleteCommentSchema,
  getCommentsByArticleSchema,
} from "./comment.schema";

const commentRouter = Router({ mergeParams: true });

commentRouter.get("/", validate(getCommentsByArticleSchema), getCommentsByArticleController);
commentRouter.post(
  "/",
  authMiddleware,
  validate(createCommentSchema),
  createCommentController
);
commentRouter.delete(
  "/:commentId",
  authMiddleware,
  validate(deleteCommentSchema),
  deleteCommentController
);

export default commentRouter;