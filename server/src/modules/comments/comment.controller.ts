import { NextFunction, Request, Response } from "express";
import {
  getCommentsByArticleSlug,
  createComment,
  deleteComment,
  toggleCommentLike,
  setArticlePinnedComment,
} from "./comment.service";
import type { CommentSortMode } from "./comment.service";
import { successResponse } from "../../common/utils/api-response";
import { AppError } from "../../common/utils/app-error";

function parseSort(raw: unknown): CommentSortMode {
  return raw === "likes" ? "likes" : "newest";
}

export async function getCommentsByArticleController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { slug } = req.params;
    const sort = parseSort(req.query?.sort);
    const userId = req.user?.userId;
    const result = await getCommentsByArticleSlug(slug as string, sort, userId);
    res.status(200).json(successResponse("Comments fetched successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function createCommentController(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user?.userId) {
      throw new AppError("Unauthorized", 401);
    }

    const { slug } = req.params;
    const { content, parentCommentId } = req.body as {
      content: string;
      parentCommentId?: string | null;
    };

    const result = await createComment(
      req.user.userId,
      slug as string,
      content,
      parentCommentId && String(parentCommentId).length === 24 ? String(parentCommentId) : undefined
    );

    res.status(201).json(successResponse("Comment created successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function deleteCommentController(req: Request, res: Response, next: NextFunction) {
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

export async function toggleCommentLikeController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user?.userId) {
      throw new AppError("Unauthorized", 401);
    }
    const { slug, commentId } = req.params;
    const result = await toggleCommentLike(
      req.user.userId,
      slug as string,
      commentId as string
    );
    res.status(200).json(successResponse("Comment like updated", result));
  } catch (error) {
    next(error);
  }
}

export async function pinCommentController(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user?.userId) {
      throw new AppError("Unauthorized", 401);
    }
    const { slug } = req.params;
    const { commentId } = req.body as { commentId: string | null };
    const result = await setArticlePinnedComment(
      req.user.userId,
      slug as string,
      commentId
    );
    res.status(200).json(successResponse("Pin updated", result));
  } catch (error) {
    next(error);
  }
}
