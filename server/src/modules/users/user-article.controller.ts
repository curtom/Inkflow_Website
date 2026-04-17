import { NextFunction, Request, Response } from "express";
import { AppError } from "../../common/utils/app-error";
import { successResponse } from "../../common/utils/api-response";
import { Article } from "../articles/article.model";


function formatArticle(article: any) {
  return {
    id: String(article._id),
    title: article.title,
    slug: article.slug,
    summary: article.summary,
    content: article.content,
    coverImage: article.coverImage ?? "",
    tags: article.tags ?? [],
    author: {
      id: String(article.author._id),
      username: article.author.username,
      email: article.author.email,
      bio: article.author.bio ?? "",
      avatar: article.author.avatar ?? "",
    },
    likesCount: article.likesCount ?? 0,
    favoritesCount: article.favoritesCount ?? 0,
    commentsCount: article.commentsCount ?? 0,
    viewsCount: article.viewsCount ?? 0,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
  };
}
export async function getMyArticlesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user?.userId) {
      throw new AppError("Unauthorized", 401);
    }

    const page =
      typeof req.query.page === "string" ? Number(req.query.page) : 1;
    const limit =
      typeof req.query.limit === "string" ? Number(req.query.limit) : 10;

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
      throw new AppError("page and limit must be positive integers", 400);
    }

    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      Article.find({ author: req.user.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "username email bio avatar"),
      Article.countDocuments({ author: req.user.userId }),
    ]);


    res.status(200).json(
      successResponse("My articles fetched successfully", {
        articles: articles.map(formatArticle),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    );
  } catch (error) {
    next(error);
  }
}

export async function getMyFavoriteArticlesController(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
     if(!req.user?.userId) {
       throw new AppError("Unauthorized", 401);
     }

     const page = typeof req.query.page === "string" ? Number(req.query.page) : 1;
     const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : 10;

     const skip = (page - 1) * limit;

     const filter = { favoritedBy: req.user.userId};

     const [articles, total] = await Promise.all([
      Article.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "username email bio avatar"),
      Article.countDocuments(filter),
    ]);

    res.status(200).json(
      successResponse("My favorite articles fetched successfully", {
        articles: articles.map(formatArticle),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    );
   } catch(error) {
      next(error);
   }
}