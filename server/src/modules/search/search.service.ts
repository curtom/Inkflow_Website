import { Article } from "../articles/article.model";
import { User } from "../users/user.model";
import { AppError } from "../../common/utils/app-error";

const MAX_SEARCH_KEYWORD_LENGTH = 80;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildSafeSearchRegex(keyword: string) {
  const normalized = keyword.trim();
  if (normalized.length > MAX_SEARCH_KEYWORD_LENGTH) {
    throw new AppError("Search keyword is too long", 400);
  }
  return new RegExp(escapeRegExp(normalized), "i");
}

type SearchStoriesInput = {
  keyword: string;
  limit?: number;
};

export async function searchStories({
  keyword,
  limit = 10,
}: SearchStoriesInput) {
  const regex = buildSafeSearchRegex(keyword);

  const stories = await Article.aggregate([
    {
      $match: {
        $or: [
          { title: regex },
          { summary: regex },
          { content: regex },
        ],
      },
    },
    {
      $addFields: {
        relevanceScore: {
          $add: [
            { $cond: [{ $regexMatch: { input: "$title", regex } }, 300, 0] },
            { $cond: [{ $regexMatch: { input: "$summary", regex } }, 200, 0] },
            { $cond: [{ $regexMatch: { input: "$content", regex } }, 100, 0] },
          ],
        },
      },
    },
    { $sort: { relevanceScore: -1, createdAt: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "author",
      },
    },
    { $unwind: "$author" },
    {
      $project: {
        id: "$_id",
        title: 1,
        slug: 1,
        summary: 1,
        content: 1,
        coverImage: 1,
        tags: 1,
        likesCount: 1,
        favoritesCount: 1,
        commentsCount: 1,
        createdAt: 1,
        updatedAt: 1,
        author: {
          id: "$author._id",
          username: "$author.username",
          bio: "$author.bio",
          avatar: "$author.avatar",
        },
      },
    },
  ]);

  return stories.map((story) => ({
    ...story,
    id: String(story.id),
    author: {
      ...story.author,
      id: String(story.author.id),
    },
  }));
}

type SearchUsersInput = {
  keyword: string;
  limit?: number;
};

export async function searchUsers({
  keyword,
  limit = 10,
}: SearchUsersInput) {
  const regex = buildSafeSearchRegex(keyword);

  const users = await User.aggregate([
    {
      $match: {
        username: regex,
      },
    },
    {
      $addFields: {
        relevanceScore: { $cond: [{ $regexMatch: { input: "$username", regex } }, 200, 0] },
      },
    },
    { $sort: { relevanceScore: -1, createdAt: -1 } },
    { $limit: limit },
    {
      $project: {
        id: "$_id",
        username: 1,
        bio: 1,
        avatar: 1,
      },
    },
  ]);

  return users.map((user) => ({
    ...user,
    id: String(user.id),
  }));
}

type SearchTagsInput = {
  keyword: string;
  limit?: number;
};

export async function searchTags({
  keyword,
  limit = 10,
}: SearchTagsInput) {
  const regex = buildSafeSearchRegex(keyword);
  const exactRegex = new RegExp(`^${escapeRegExp(keyword.trim())}$`, "i");

  const tags = await Article.aggregate([
    { $unwind: "$tags" },
    {
      $match: {
        tags: regex,
      },
    },
    {
      $group: {
        _id: "$tags",
        articleCount: { $sum: 1 },
      },
    },
    {
      $addFields: {
        relevanceScore: {
          $add: [
            { $cond: [{ $regexMatch: { input: "$_id", regex: exactRegex } }, 200, 0] },
            { $cond: [{ $regexMatch: { input: "$_id", regex } }, 100, 0] },
            "$articleCount",
          ],
        },
      },
    },
    { $sort: { relevanceScore: -1, articleCount: -1 } },
    { $limit: limit },
    {
      $project: {
        name: "$_id",
        articleCount: 1,
      },
    },
  ]);

  return tags;
}

export async function searchOverview(keyword: string) {
  const [stories, users, tags] = await Promise.all([
    searchStories({ keyword, limit: 10 }),
    searchUsers({ keyword, limit: 8 }),
    searchTags({ keyword, limit: 10 }),
  ]);

  return {
    stories,
    users,
    tags,
  };
}