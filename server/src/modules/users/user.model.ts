import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    bio?: string;
    avatar?: string;
    notificationsLastViewedAt?: Date;
    /** Pinned to top of this user's public / my-article list (one post). */
    profilePinnedArticle?: Types.ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            minlength: 3,
            maxlength: 20,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        bio: {
            type: String,
            default: "",
        },
        avatar: {
            type: String,
            default: "",
        },
        notificationsLastViewedAt: {
            type: Date,
            default: undefined,
        },
        profilePinnedArticle: {
            type: Schema.Types.ObjectId,
            ref: "Article",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

export const User = mongoose.model<IUser>("User", UserSchema);