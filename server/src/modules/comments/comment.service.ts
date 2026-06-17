import mongoose, { Types } from "mongoose";
import { AppError } from "../../common/utils/app-error";
import { Article } from "../articles/article.model";
import { Comment } from "./comment.model";

const MAX_THREAD_DEPTH = 10;

export type CommentSortMode = "likes" | "newest";

type CommentAuthor = {
  _id: unknown;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
};

type CommentNodeOut = {
  id: string;
  content: string;
  author: ReturnType<typeof sanitizeAuthor>;
  parentCommentId: string | null;
  likesCount: number;
  isLiked: boolean;
  createdAt: Date;
  updatedAt: Date;
  replies: CommentNodeOut[];
  /** Total comments in subtree under this node (all depths), excluding this comment */
  replyCount: number;
};

function sanitizeAuthor(author: CommentAuthor) {
  return {
    id: String(author._id),
    username: author.username,
    email: author.email,
    bio: author.bio ?? "",
    avatar: author.avatar ?? "",
  };
}

/** Depth of `comment` in its thread: root = 1 */
async function getDepthFromRoot(commentId: mongoose.Types.ObjectId): Promise<number> {
  let depth = 0;
  let current: mongoose.Types.ObjectId | null = commentId;
  const guard = 50;
  let g = 0;
  while (current && g < guard) {
    g += 1;
    depth += 1;
    const row = (await Comment.findById(current).select("parentComment").lean()) as {
      parentComment?: mongoose.Types.ObjectId | null;
    } | null;
    if (!row) {
      break;
    }
    current = row.parentComment ?? null;
  }
  return depth;
}

type LeanComment = {
  _id: mongoose.Types.ObjectId;
  content: string;
  author: CommentAuthor;
  parentComment: mongoose.Types.ObjectId | null;
  likedBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
};

function buildTree(
  flat: LeanComment[],
  userId: string | undefined,
  sort: CommentSortMode
): CommentNodeOut[] {
  const byId = new Map<string, CommentNodeOut>();

  for (const row of flat) {
    const id = String(row._id);
    const likes = row.likedBy?.length ?? 0;
    const isLiked = userId
      ? row.likedBy?.some((u) => String(u) === userId) ?? false
      : false;
    byId.set(id, {
      id,
      content: row.content,
      author: sanitizeAuthor(row.author as CommentAuthor),
      parentCommentId: row.parentComment ? String(row.parentComment) : null,
      likesCount: likes,
      isLiked,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      replies: [],
      replyCount: 0,
    });
  }

  const roots: CommentNodeOut[] = [];
  for (const row of flat) {
    const id = String(row._id);
    const node = byId.get(id)!;
    const pid = row.parentComment ? String(row.parentComment) : null;
    if (!pid) {
      roots.push(node);
    } else {
      const parent = byId.get(pid);
      if (parent) {
        parent.replies.push(node);
      } else {
        roots.push(node);
      }
    }
  }

  function countSubtreeReplies(n: CommentNodeOut): number {
    let total = 0;
    for (const ch of n.replies) {
      total += 1 + countSubtreeReplies(ch);
    }
    n.replyCount = total;
    return total;
  }

  function sortRepliesChronological(nodes: CommentNodeOut[]) {
    nodes.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    for (const n of nodes) {
      sortRepliesChronological(n.replies);
    }
  }

  if (sort === "likes") {
    roots.sort(
      (a, b) => b.likesCount - a.likesCount || b.createdAt.getTime() - a.createdAt.getTime()
    );
  } else {
    roots.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  for (const r of roots) {
    sortRepliesChronological(r.replies);
  }

  for (const r of roots) {
    countSubtreeReplies(r);
  }
  return roots;
}

function movePinnedToFront(roots: CommentNodeOut[], pinnedId: string | null): CommentNodeOut[] {
  if (!pinnedId) {
    return roots;
  }
  const i = roots.findIndex((r) => r.id === pinnedId);
  if (i <= 0) {
    return roots;
  }
  const next = roots.slice();
  const [p] = next.splice(i, 1);
  return [p, ...next];
}

export async function getCommentsByArticleSlug(
  slug: string,
  sort: CommentSortMode,
  userId: string | undefined
) {
  const article = await Article.findOne({ slug });

  if (!article) {
    throw new AppError("Article not found", 404);
  }

  const pinnedId =
    article.pinnedComment != null ? String(article.pinnedComment) : null;

  const rows = (await Comment.find({ article: article._id })
    .sort({ createdAt: 1 })
    .populate("author", "username email bio avatar")
    .lean()) as unknown as LeanComment[];

  let comments = buildTree(rows, userId, sort);
  comments = movePinnedToFront(comments, pinnedId);

  return { comments, total: rows.length, pinnedCommentId: pinnedId };
}

export async function createComment(
  userId: string,
  slug: string,
  content: string,
  parentCommentId?: string | null
) {
  const article = await Article.findOne({ slug });

  if (!article) {
    throw new AppError("Article not found", 404);
  }

  let parent: mongoose.Types.ObjectId | null = null;
  if (parentCommentId) {
    const p = await Comment.findById(parentCommentId).lean();
    if (!p) {
      throw new AppError("Parent comment not found", 404);
    }
    if (String(p.article) !== String(article._id)) {
      throw new AppError("Parent comment does not belong to this article", 400);
    }
    const parentDepth = await getDepthFromRoot(p._id as mongoose.Types.ObjectId);
    if (parentDepth >= MAX_THREAD_DEPTH) {
      throw new AppError("Reply thread is too deep", 400);
    }
    parent = p._id as mongoose.Types.ObjectId;
  }

  const comment = await Comment.create({
    article: article._id,
    author: userId,
    parentComment: parent,
    content,
    likedBy: [],
  });

  article.commentsCount += 1;
  await article.save();

  const populatedComment = await Comment.findById(comment._id).populate(
    "author",
    "username email bio avatar"
  );

  if (!populatedComment) {
    throw new AppError("Comment not found after creation", 500);
  }

  const c = populatedComment as unknown as {
    _id: unknown;
    content: string;
    author: CommentAuthor;
    parentComment: unknown;
    likedBy: unknown[];
    createdAt: Date;
    updatedAt: Date;
  };

  return {
    comment: {
      id: String(c._id),
      content: c.content,
      author: sanitizeAuthor(c.author),
      parentCommentId: c.parentComment ? String(c.parentComment) : null,
      likesCount: 0,
      isLiked: false,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    },
  };
}

export async function deleteComment(userId: string, slug: string, commentId: string) {
  const article = await Article.findOne({ slug });

  if (!article) {
    throw new AppError("Article not found", 404);
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new AppError("Comment not found", 404);
  }

  if (String(comment.article) !== String(article._id)) {
    throw new AppError("Comment does not belong to this article", 400);
  }

  if (String(comment.author) !== userId) {
    throw new AppError("Forbidden: You can only delete your own comment", 403);
  }

  await Comment.updateMany(
    { article: article._id, parentComment: comment._id },
    { $set: { parentComment: comment.parentComment ?? null } }
  );
  await Comment.deleteOne({ _id: comment._id });

  article.commentsCount = Math.max(0, (article.commentsCount ?? 0) - 1);
  if (
    article.pinnedComment &&
    String(comment._id) === String(article.pinnedComment)
  ) {
    article.pinnedComment = null;
  }
  await article.save();

  return {
    deleted: true,
    removedCount: 1,
  };
}

export async function toggleCommentLike(userId: string, slug: string, commentId: string) {
  const article = await Article.findOne({ slug });
  if (!article) {
    throw new AppError("Article not found", 404);
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }
  if (String(comment.article) !== String(article._id)) {
    throw new AppError("Comment does not belong to this article", 400);
  }

  const uid = new mongoose.Types.ObjectId(userId);
  const list = (comment.likedBy as unknown[]) || [];
  const has = list.some((id) => String(id) === userId);
  if (has) {
    comment.likedBy = list.filter((id) => String(id) !== userId) as typeof comment.likedBy;
  } else {
    comment.likedBy = [...list, uid] as typeof comment.likedBy;
  }
  await comment.save();

  return {
    liked: !has,
    likesCount: comment.likedBy.length,
  };
}

export async function setArticlePinnedComment(
  authorId: string,
  slug: string,
  commentId: string | null
) {
  const article = await Article.findOne({ slug });
  if (!article) {
    throw new AppError("Article not found", 404);
  }
  if (String(article.author) !== authorId) {
    throw new AppError("Only the post author can pin comments", 403);
  }

  if (commentId === null) {
    article.pinnedComment = null;
    await article.save();
    return { pinnedCommentId: null as string | null };
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }
  if (String(comment.article) !== String(article._id)) {
    throw new AppError("Comment does not belong to this article", 400);
  }
  if (comment.parentComment) {
    throw new AppError("Only top-level comments can be pinned", 400);
  }

  article.pinnedComment = comment._id as Types.ObjectId;
  await article.save();
  return { pinnedCommentId: String(comment._id) };
}
