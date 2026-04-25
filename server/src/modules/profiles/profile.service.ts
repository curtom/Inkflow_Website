import type { Types } from "mongoose";
import { AppError } from "../../common/utils/app-error";
import { Article } from "../articles/article.model";
import { User } from "../users/user.model";
import { Follow } from "../follows/follow.model";

export type ProfileArticleSort = "newest" | "likes";


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

  /**
   * Paginated list for a user's profile, with optional profile pin on page 1.
   * Pinned post is returned separately on page 1 and excluded from `articles` to avoid duplicate.
   */
  export async function getAuthorArticlesListWithProfilePin(
    user: { _id: Types.ObjectId; profilePinnedArticle?: Types.ObjectId | null },
    page: number,
    limit: number,
    sort: ProfileArticleSort,
    currentUserId?: string
  ) {
    const total = await Article.countDocuments({ author: user._id });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let pinnedDoc: any = null;
    if (user.profilePinnedArticle) {
      pinnedDoc = await Article.findOne({
        _id: user.profilePinnedArticle,
        author: user._id,
      }).populate("author", "username email bio avatar");
    }
    if (user.profilePinnedArticle && !pinnedDoc) {
      await User.updateOne({ _id: user._id }, { $unset: { profilePinnedArticle: 1 } });
    }

    const nePinned = pinnedDoc?._id ? { _id: { $ne: pinnedDoc._id } } : {};

    const findFilter = { author: user._id, ...nePinned };

    const nonPinnedSkip =
      page <= 1
        ? 0
        : pinnedDoc
          ? (page - 1) * limit - 1
          : (page - 1) * limit;
    const nonPinnedLimit =
      page === 1 && pinnedDoc ? Math.max(0, limit - 1) : limit;

    let listQuery = Article.find(findFilter);
    if (sort === "likes") {
      listQuery = listQuery.sort({ likesCount: -1, createdAt: -1 });
    } else {
      listQuery = listQuery.sort({ createdAt: -1 });
    }
    const rows = await listQuery
      .skip(nonPinnedSkip)
      .limit(nonPinnedLimit)
      .populate("author", "username email bio avatar");

    const profilePinnedArticleId = pinnedDoc ? String(pinnedDoc._id) : null;
    const pinnedArticle =
      page === 1 && pinnedDoc ? sanitizeArticle(pinnedDoc, currentUserId) : null;

    return {
      profilePinnedArticleId,
      pinnedArticle,
      articles: rows.map((a) => sanitizeArticle(a, currentUserId)),
      pagination: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }

  export async function getPublicProfileArticles(
     username: string,
     page = 1,
     limit = 10,
     currentUserId?: string,
     sort: ProfileArticleSort = "newest"
  ) {
     const user = await User.findOne({ username });

     if (!user) {
        throw new AppError("User not found", 404);
     }

     const [list, followMeta] = await Promise.all([
        getAuthorArticlesListWithProfilePin(
          user,
          page,
          limit,
          sort,
          currentUserId
        ),
        getFollowMeta(String(user._id), currentUserId),
     ]);

    return {
        user: {
          ...sanitizeUser(user),
          ...followMeta,
        },
        profilePinnedArticleId: list.profilePinnedArticleId,
        pinnedArticle: list.pinnedArticle,
        articles: list.articles,
        pagination: list.pagination,
    };
  }

  export async function setUserProfilePinnedArticle(
    userId: string,
    articleId: string | null
  ) {
    if (articleId === null) {
      await User.updateOne({ _id: userId }, { $unset: { profilePinnedArticle: 1 } });
      return { profilePinnedArticleId: null as string | null };
    }

    const article = await Article.findById(articleId);
    if (!article) {
      throw new AppError("Article not found", 404);
    }
    if (String(article.author) !== userId) {
      throw new AppError("You can only pin your own post", 403);
    }

    await User.updateOne(
      { _id: userId },
      { $set: { profilePinnedArticle: article._id } }
    );
    return { profilePinnedArticleId: String(article._id) };
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