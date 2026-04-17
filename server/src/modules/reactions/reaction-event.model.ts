import mongoose, { Document, Schema, Types } from "mongoose";

export type ReactionType = "like" | "favorite";

export interface IReactionEvent extends Document {
  article: Types.ObjectId;
  articleAuthor: Types.ObjectId;
  user: Types.ObjectId;
  type: ReactionType;
  createdAt: Date;
  updatedAt: Date;
}

const reactionEventSchema = new Schema<IReactionEvent>(
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
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "favorite"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

reactionEventSchema.index({ article: 1, user: 1, type: 1 }, { unique: true });
reactionEventSchema.index({ articleAuthor: 1, type: 1, createdAt: -1 });

export const ReactionEvent = mongoose.model<IReactionEvent>("ReactionEvent", reactionEventSchema);
