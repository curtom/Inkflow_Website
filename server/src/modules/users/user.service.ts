import { AppError } from "../../common/utils/app-error";
import { hashPassword } from "../../common/utils/hash";
import { User } from "./user.model";

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

export async function getCurrentUserProfile(userId: string) {
    const user = await User.findById(userId);

    if(!user) {
        throw new AppError("User not found", 404);
    }

    return {
        user:sanitizeUser(user),
    };
}

type UpdateCurrentUserInput = {
    username?: string;
    bio?: string;
    avatar?: string;
    password?: string;
};

export async function updateCurrentUserProfile(
    userId: string,
    payload: UpdateCurrentUserInput
) {
    const user = await User.findById(userId);
    if(!user) {
        throw new AppError("User not found", 404);
    }

    if(payload.username && payload.username !== user.username) {
        const existingUser = await User.findOne({username: payload.username});
        if(existingUser) {
            throw new AppError("Username already exists", 409);
        }

        user.username = payload.username;
    }

    if (payload.bio !== undefined) {
        user.bio = payload.bio;
    }

    if (payload.avatar !== undefined) {
        user.avatar = payload.avatar;
    }

    if (payload.password) {
        user.password = await hashPassword(payload.password);
    }

    await user.save();

    return {
        user: sanitizeUser(user),
    };
}
