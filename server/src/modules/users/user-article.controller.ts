import { NextFunction, Request, Response } from "express";
import { AppError } from "../../common/utils/app-error";
import { successResponse } from "../../common/utils/api-response";
import { Article } from "../articles/article.model";

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

    const formatted = articles.map((article: any) => ({
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
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    }));

    res.status(200).json(
      successResponse("My articles fetched successfully", {
        articles: formatted,
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