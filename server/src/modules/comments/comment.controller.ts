import { NextFunction, Request, Response } from "express";
import { getCommentsByArticleSlug, createComment, deleteComment } from "./comment.service";
import { successResponse } from "../../common/utils/api-response";
import { AppError } from "../../common/utils/app-error";

export async function getCommentsByArticleController(
    req: Request,
    res: Response,
    next: NextFunction
) {
   try {
    const { slug } = req.params;
    const result = await getCommentsByArticleSlug(slug as string);
    res.status(200).json(successResponse("Comments fetched successfully", result));
   } catch (error) {
    next(error);
   }
}

export async function createCommentController(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user?.userId) {
        throw new AppError("Unauthorized", 401);
      }
  
      const { slug } = req.params;
      const { content } = req.body;
  
      const result = await createComment(req.user.userId, slug as string, content);
  
      res.status(201).json(successResponse("Comment created successfully", result));
    } catch (error) {
      next(error);
    }
  }
  
  export async function deleteCommentController(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user?.userId) {
        throw new AppError("Unauthorized", 401);
      }
  
      const { slug, commentId } = req.params;
      const result = await deleteComment(req.user.userId, slug as string, commentId as string);
  
      res.status(200).json(successResponse("Comment deleted successfully", result));
    } catch (error) {
      next(error);
    }
  }