import { AppError } from "../../common/utils/app-error";
import { Article } from "../articles/article.model";
import { User } from "../users/user.model";
import { Follow } from "../follows/follow.model";


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
  
  function sanitizeArticle(article: any, currentUserId?: string) {
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
      isLiked: currentUserId
        ? (article.likedBy ?? []).some((id: unknown) => String(id) === currentUserId)
        : false,
      isFavorited: currentUserId
        ? (article.favoritedBy ?? []).some((id: unknown) => String(id) === currentUserId)
        : false,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    };
  }

  async function getFollowMeta(targetUserId: string, currentUserId?: string) {
    const [followersCount, followingCount, isFollowing] = await Promise.all([
      Follow.countDocuments({ following: targetUserId }),
      Follow.countDocuments({ follower: targetUserId }),
      currentUserId
        ? Follow.exists({ follower: currentUserId, following: targetUserId }).then(Boolean)
        : Promise.resolve(false),
    ]);

    return {
      followersCount,
      followingCount,
      isFollowing,
    };
  }

  export async function getPublicProfileByUsername(username: string, currentUserId?: string) {
    const user = await User.findOne({ username });

    if(!user) {
        throw new AppError("User not found", 404);
    }

    const followMeta = await getFollowMeta(String(user._id), currentUserId);

    return {
        user: {
          ...sanitizeUser(user),
          ...followMeta,
        },
    };
  }

  export async function getPublicProfileArticles(
     username: string,
     page = 1,
     limit = 10,
     currentUserId?: string,
     sort: "newest" | "likes" = "newest"
  ) {
     const user = await User.findOne({ username});

     if(!user) {
        throw new AppError("User not found", 404);
     }

     const skip = (page - 1) * limit;

     const [articles, total, followMeta] = await Promise.all([
        (sort === "likes"
          ? Article.find({ author: user._id }).sort({ likesCount: -1, createdAt: -1 })
          : Article.find({ author: user._id }).sort({ createdAt: -1 })
        )
        .skip(skip)
        .limit(limit)
        .populate("author", "username email bio avatar"),
        Article.countDocuments({ author: user._id }),
        getFollowMeta(String(user._id), currentUserId),
    ]);

    return {
        user: {
          ...sanitizeUser(user),
          ...followMeta,
        },
        articles: articles.map((article) => sanitizeArticle(article, currentUserId)),
        pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        },
    };
  }

  export async function followUserByUsername(currentUserId: string, username: string) {
    const targetUser = await User.findOne({ username });

    if (!targetUser) {
      throw new AppError("User not found", 404);
    }

    if (String(targetUser._id) === currentUserId) {
      throw new AppError("You cannot follow yourself", 400);
    }

    await Follow.updateOne(
      { follower: currentUserId, following: targetUser._id },
      {
        $setOnInsert: {
          follower: currentUserId,
          following: targetUser._id,
        },
      },
      { upsert: true }
    );

    const followMeta = await getFollowMeta(String(targetUser._id), currentUserId);

    return {
      user: {
        ...sanitizeUser(targetUser),
        ...followMeta,
      },
      following: true,
    };
  }

  export async function unfollowUserByUsername(currentUserId: string, username: string) {
    const targetUser = await User.findOne({ username });

    if (!targetUser) {
      throw new AppError("User not found", 404);
    }

    await Follow.deleteOne({ follower: currentUserId, following: targetUser._id });
    const followMeta = await getFollowMeta(String(targetUser._id), currentUserId);

    return {
      user: {
        ...sanitizeUser(targetUser),
        ...followMeta,
      },
      following: false,
    };
  }