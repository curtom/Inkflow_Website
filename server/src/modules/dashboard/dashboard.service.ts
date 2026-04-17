import mongoose from "mongoose";
import { AppError } from "../../common/utils/app-error";
import { Article } from "../articles/article.model";
import { Comment } from "../comments/comment.model";
import { ReactionEvent } from "../reactions/reaction-event.model";
import { ArticleView } from "../views/article-view.model";
import { Follow } from "../follows/follow.model";

type DashboardUser = {
  _id: unknown;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
};

function sanitizeUser(user: DashboardUser) {
  return {
    id: String(user._id),
    username: user.username,
    email: user.email,
    bio: user.bio ?? "",
    avatar: user.avatar ?? "",
  };
}

function monthLabel(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function resolveMonthRange(month?: number) {
  const now = new Date();
  const year = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const selectedMonth = month ?? currentMonth;

  if (selectedMonth < 1 || selectedMonth > currentMonth) {
    throw new AppError(`month must be between 1 and ${currentMonth}`, 400);
  }

  const start = new Date(year, selectedMonth - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, selectedMonth, 1, 0, 0, 0, 0);
  const daysInMonth = new Date(year, selectedMonth, 0).getDate();

  const availableMonths = Array.from({ length: currentMonth }, (_, index) => {
    const value = index + 1;
    return {
      value,
      label: monthLabel(year, value),
    };
  });

  return {
    year,
    month: selectedMonth,
    start,
    end,
    daysInMonth,
    availableMonths,
  };
}

export async function getDashboardOverview(userId: string, month?: number) {
  const { year, month: selectedMonth, start, end, daysInMonth, availableMonths } = resolveMonthRange(month);
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const myArticles = await Article.find({ author: userObjectId }).select("_id").lean();
  const articleIds = myArticles.map((article) => article._id);

  const [viewsCount, commentsCount, likesCount, favoritesCount, viewSeriesResult] = await Promise.all([
    ArticleView.countDocuments({
      articleAuthor: userObjectId,
      viewedAt: { $gte: start, $lt: end },
    }),
    articleIds.length
      ? Comment.countDocuments({
          article: { $in: articleIds },
          createdAt: { $gte: start, $lt: end },
        })
      : Promise.resolve(0),
    ReactionEvent.countDocuments({
      articleAuthor: userObjectId,
      type: "like",
      createdAt: { $gte: start, $lt: end },
    }),
    ReactionEvent.countDocuments({
      articleAuthor: userObjectId,
      type: "favorite",
      createdAt: { $gte: start, $lt: end },
    }),
    ArticleView.aggregate<{ _id: number; count: number }>([
      {
        $match: {
          articleAuthor: userObjectId,
          viewedAt: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: "$viewedAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const dayToCount = new Map<number, number>();
  for (const item of viewSeriesResult) {
    dayToCount.set(item._id, item.count);
  }

  const dailyViews = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    return {
      day,
      viewsCount: dayToCount.get(day) ?? 0,
    };
  });

  return {
    year,
    month: selectedMonth,
    availableMonths,
    summary: {
      viewsCount,
      commentsCount,
      likesCount,
      favoritesCount,
    },
    dailyViews,
  };
}

export async function getDashboardSocial(userId: string) {
  const [followingRows, followerRows] = await Promise.all([
    Follow.find({ follower: userId })
      .sort({ createdAt: -1 })
      .populate("following", "username email bio avatar"),
    Follow.find({ following: userId })
      .sort({ createdAt: -1 })
      .populate("follower", "username email bio avatar"),
  ]);

  const following = followingRows
    .filter((row) => row.following)
    .map((row) => ({
      user: sanitizeUser(row.following as unknown as DashboardUser),
      followedAt: row.createdAt,
    }));

  const followers = followerRows
    .filter((row) => row.follower)
    .map((row) => ({
      user: sanitizeUser(row.follower as unknown as DashboardUser),
      followedAt: row.createdAt,
    }));

  return {
    following,
    followers,
  };
}

export async function getDashboardHistory(userId: string, page = 1, limit = 20) {
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
    throw new AppError("page and limit must be positive integers", 400);
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const skip = (page - 1) * limit;

  const [items, totalResult] = await Promise.all([
    ArticleView.aggregate<{
      articleId: mongoose.Types.ObjectId;
      viewsCount: number;
      lastViewedAt: Date;
      article: {
        _id: unknown;
        title: string;
        slug: string;
        summary: string;
      };
      author: DashboardUser;
    }>([
      { $match: { viewerUser: userObjectId } },
      { $sort: { viewedAt: -1 } },
      {
        $group: {
          _id: "$article",
          viewsCount: { $sum: 1 },
          lastViewedAt: { $first: "$viewedAt" },
        },
      },
      { $sort: { lastViewedAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "articles",
          localField: "_id",
          foreignField: "_id",
          as: "article",
        },
      },
      { $unwind: "$article" },
      {
        $lookup: {
          from: "users",
          localField: "article.author",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },
      {
        $project: {
          _id: 0,
          articleId: "$article._id",
          viewsCount: 1,
          lastViewedAt: 1,
          article: {
            _id: "$article._id",
            title: "$article.title",
            slug: "$article.slug",
            summary: "$article.summary",
          },
          author: {
            _id: "$author._id",
            username: "$author.username",
            email: "$author.email",
            bio: "$author.bio",
            avatar: "$author.avatar",
          },
        },
      },
    ]),
    ArticleView.aggregate<{ total: number }>([
      { $match: { viewerUser: userObjectId } },
      { $group: { _id: "$article" } },
      { $count: "total" },
    ]),
  ]);

  const total = totalResult[0]?.total ?? 0;

  return {
    items: items.map((item) => ({
      article: {
        id: String(item.article._id),
        title: item.article.title,
        slug: item.article.slug,
        summary: item.article.summary,
        author: sanitizeUser(item.author),
      },
      viewsCount: item.viewsCount,
      lastViewedAt: item.lastViewedAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
