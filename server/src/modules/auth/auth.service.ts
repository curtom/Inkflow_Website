import { AppError } from "../../common/utils/app-error";
import { comparePassword, hashPassword } from "../../common/utils/hash";
import { generateToken } from "../../common/utils/jwt";
import { User } from "../users/user.model";

type RegisterInput = {
    username: string;
    email: string;
    password: string;
};

type LoginInput = {
    email: string;
    password: string;
};

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

export async function registerUser(payload: RegisterInput) {
    const { username, email, password } = payload;

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
        throw new AppError("Username already exists", 409);
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
        throw new AppError("Email already exists", 409);
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
        username,
        email,
        password: hashedPassword,
    });

    const token = generateToken({ userId: String(user._id) });

    return {
        user: sanitizeUser(user),
        token,
    };
}

export async function loginUser(payload: LoginInput) {
    const {email, password} = payload;

    const user = await User.findOne({email});
    if (!user) {
        throw new AppError("Invalid email or password", 401);
    }

    const isPasswordMatched = await comparePassword(password, user.password);
    if (!isPasswordMatched) {
        throw new AppError("Invalid email or password", 401);
    }

    const token = generateToken({userId: String(user._id)});

    return {
        user: sanitizeUser(user),
        token,
    };
}

export async function getCurrentUser(userId: string) {
        const user = await User.findById(userId);

        if (!user) {
            throw new AppError("User not found", 404);
        }

        return {
            user: sanitizeUser(user),
        };
}