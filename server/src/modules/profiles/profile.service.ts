import { AppError } from "../../common/utils/app-error";
import { Article } from "../articles/article.model";
import { User } from "../users/user.model";


function sanitizeUser(user: {
    _id: unknown;
    username: string;
    email: string;
    bio?: string;
    avatar?: string;
  }) {
    return {
      id: String(user._id),
      username: user.username,
      email: user.email,
      bio: user.bio ?? "",
      avatar: user.avatar ?? "",
    };
  }
  
  function sanitizeArticle(article: any) {
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
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    };
  }

  export async function getPublicProfileByUsername(username: string) {
    const user = await User.findOne({ username });

    if(!user) {
        throw new AppError("User not found", 404);
    }

    return {
        user: sanitizeUser(user),
    };
  }

  export async function getPublicProfileArticles(
     username: string,
     page = 1,
     limit = 10
  ) {
     const user = await User.findOne({ username});

     if(!user) {
        throw new AppError("User not found", 404);
     }

     const skip = (page - 1) * limit;

     const [articles, total] = await Promise.all([
        Article.find({ author: user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "username email bio avatar"),
        Article.countDocuments({ author: user._id }),
    ]);

    return {
        user: sanitizeUser(user),
        articles: articles.map(sanitizeArticle),
        pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        },
    };
  }