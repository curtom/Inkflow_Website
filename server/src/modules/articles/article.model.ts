import mongoose, {Document, Schema, Types} from "mongoose";


export interface IArticle extends Document {
    title: string;
    slug: string;
    summary: string;
    content: string;
    coverImage?: string;
    tags: string[];
    author: Types.ObjectId;
    likedBy: Types.ObjectId[];
    favoritedBy: Types.ObjectId[];
    likesCount: number;
    favoritesCount: number;
    commentsCount: number;
    viewsCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const articleSchema = new Schema<IArticle>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 120,
        },
        slug: {
            type: String,
            required: true,
            trim: true,
        },
        summary: {
            type: String,
            required: true,
            trim: true,
            maxlength: 300,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        coverImage: {
            type: String,
            default: "",
            },
        tags: {
            type: [String],
            default: [],
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        likedBy: {
            type: [Schema.Types.ObjectId],
            ref: "User",
            default: [],
          },
          favoritedBy: {
            type: [Schema.Types.ObjectId],
            ref: "User",
            default: [],
          },
          likesCount: {
            type: Number,
            default: 0,
          },
          favoritesCount: {
            type: Number,
            default: 0,
          },
          commentsCount: {
            type: Number,
            default: 0,
          },
          viewsCount: {
            type: Number,
            default: 0,
          },
    },
    {
        timestamps: true,
    }
);

articleSchema.index({ slug: 1 }, { unique: true });
articleSchema.index({ author: 1 });
articleSchema.index({ createdAt: -1 });

export const Article = mongoose.model<IArticle>("Article", articleSchema);