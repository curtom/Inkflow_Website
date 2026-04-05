import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { AppError } from "../utils/app-error";

export function authMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction,
) {
    try {
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AppError("Unauthorized", 401);
        }
        const token = authHeader.split(" ")[1];

        if (!token) {
            throw new AppError("Unauthorized", 401);
        }

        const decoded = verifyToken(token);

        req.user = {
            userId: decoded.userId,
        };

        next();
    }catch(error) {
        next(new AppError("Invalid or expired token", 401));
    }
}