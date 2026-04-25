import mongoose, { Document, Schema, Types } from "mongoose";

export interface IComment extends Document {
  article: Types.ObjectId;
  author: Types.ObjectId;
  parentComment: Types.ObjectId | null;
  content: string;
  likedBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    article: {
      type: Schema.Types.ObjectId,
      ref: "Article",
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 1000,
    },
    likedBy: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.index({ article: 1, createdAt: -1 });
commentSchema.index({ article: 1, parentComment: 1, createdAt: 1 });
commentSchema.index({ author: 1 });

export const Comment = mongoose.model<IComment>("Comment", commentSchema);
