import { AppError } from "../../common/utils/app-error";
import { toggleFavoriteArticle, toggleLikeArticle } from "./reaction.service";
import { NextFunction, Request, Response } from "express";
import { successResponse } from "../../common/utils/api-response";



export async function toggleLikeArticleController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try{
      if(!req.user?.userId) {
        throw new AppError("Unauthorized", 401);
      }

      const { slug } = req.params;

      const result = await toggleLikeArticle(req.user.userId, slug as string);

      res.status(200).json(successResponse("Article like toggled successfully", result));
    } catch (error) {
        next(error);
    }
}

export async function toggleFavoriteArticleController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
      if(!req.user?.userId) {
        throw new AppError("Unauthorized", 401);
      }

      const { slug } = req.params;
      const result = await toggleFavoriteArticle(req.user.userId, slug as string);

      res.status(200).json(successResponse("Article favorited successfully", result));
    }catch (error) {
        next(error);
    }
}