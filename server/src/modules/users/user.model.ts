import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    bio?: string;
    avatar?: string;
    notificationsLastViewedAt?: Date;
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
    },
    {
        timestamps: true,
    }
);

export const User = mongoose.model<IUser>("User", UserSchema);