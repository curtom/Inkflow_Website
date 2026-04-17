import mongoose, { Document, Schema, Types } from "mongoose";

export interface IArticleView extends Document {
  article: Types.ObjectId;
  articleAuthor: Types.ObjectId;
  viewerUser?: Types.ObjectId;
  viewerFingerprint: string;
  hourBucket: Date;
  viewedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const articleViewSchema = new Schema<IArticleView>(
  {
    article: {
      type: Schema.Types.ObjectId,
      ref: "Article",
      required: true,
    },
    articleAuthor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    viewerUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: undefined,
    },
    viewerFingerprint: {
      type: String,
      required: true,
      trim: true,
    },
    hourBucket: {
      type: Date,
      required: true,
    },
    viewedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

articleViewSchema.index({ article: 1, viewerFingerprint: 1, hourBucket: 1 }, { unique: true });
articleViewSchema.index({ articleAuthor: 1, viewedAt: -1 });
articleViewSchema.index({ viewerUser: 1, viewedAt: -1 });

export const ArticleView = mongoose.model<IArticleView>("ArticleView", articleViewSchema);
