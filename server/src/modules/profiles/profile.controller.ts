import { Request, Response, NextFunction } from "express";
import {
  getPublicProfileByUsername,
  getPublicProfileArticles,
  followUserByUsername,
  unfollowUserByUsername,
} from "./profile.service";
import { successResponse } from "../../common/utils/api-response";
import { AppError } from "../../common/utils/app-error";


export async function getPublicProfileController(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
     const { username } = req.params;
     const result = await getPublicProfileByUsername(username as string, req.user?.userId);

     res.status(200).json(successResponse("Public profile fetched successfully", result));
   } catch(error) {
    next(error);
   }
}

export async function getPublicProfileArticlesController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { username } = req.params;
        const page = typeof req.query.page === "string" ? Number(req.query.page) : 1;
        const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : 10;
        const sortParam = req.query.sort === "likes" ? "likes" : "newest";

        const result = await getPublicProfileArticles(
          username as string,
          page,
          limit,
          req.user?.userId,
          sortParam
        );

        res.status(200).json(successResponse("Public profile articles fetched successfully", result));
    } catch(error) {
        next(error);
    }
}

export async function followUserController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user?.userId) {
      throw new AppError("Unauthorized", 401);
    }

    const { username } = req.params;
    const result = await followUserByUsername(req.user.userId, username as string);
    res.status(200).json(successResponse("Followed successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function unfollowUserController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user?.userId) {
      throw new AppError("Unauthorized", 401);
    }

    const { username } = req.params;
    const result = await unfollowUserByUsername(req.user.userId, username as string);
    res.status(200).json(successResponse("Unfollowed successfully", result));
  } catch (error) {
    next(error);
  }
}
