import { AppError } from "../../common/utils/app-error";
import { Article } from "../articles/article.model";
import { Comment } from "./comment.model";

type CommentAuthor = {
    _id: unknown;
    username: string;
    email: string;
    bio?: string;
    avatar?: string;
};

type CommentDocumentLike = {
    _id: unknown;
    content: string;
    author: CommentAuthor;
    createdAt: Date;
    updatedAt: Date;
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
  
  function sanitizeComment(comment: CommentDocumentLike) {
    return {
      id: String(comment._id),
      content: comment.content,
      author: sanitizeAuthor(comment.author),
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }

  export async function getCommentsByArticleSlug(slug: string) {
    const article = await Article.findOne({ slug });

    if(!article) {
        throw new AppError("Article not found", 404);
    }

    const comments = await Comment.find({ article: article._id })
      .sort({ createdAt: -1 })
      .populate("author", "username email bio avatar");

      return {
        comments: comments.map((comment) => 
            sanitizeComment(comment as unknown as CommentDocumentLike)
        ),
      };
  }

  export async function createComment(
       userId: string,
       slug: string,
       content: string
  ) {
      const article = await Article.findOne({ slug });

      if(!article) {
        throw new AppError("Article not found", 404);
      }

      const comment = await Comment.create({
        article: article._id,
        author: userId,
        content,
      });

      article.commentsCount += 1;
      await article.save();

      const populatedComment = await Comment.findById(comment._id).populate(
        "author",
        "username email bio avatar"
      );

      if(!populatedComment) {
        throw new AppError("Comment not found after creation", 500);
      }

      return {
        comment: sanitizeComment(populatedComment as unknown as CommentDocumentLike),
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
  
    await Comment.deleteOne({ _id: comment._id });

    article.commentsCount = Math.max(0, article.commentsCount - 1);
    await article.save();
  
    return {
      deleted: true,
    };
  }