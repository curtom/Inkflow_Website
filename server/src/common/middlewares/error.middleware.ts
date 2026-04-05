import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error";

export function errorMiddleware(
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    if (error instanceof ZodError) {
        return res.status(400).json({
            message: "Validation failed",
            errors: error.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message,
            })),
        });
    }

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            message: error.message,
        });
    }

    if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000
    ) {
        return res.status(409).json({
            message: "Duplicate field value",
        });
    }

    console.error("Unhandled error:", error);

    return res.status(500).json({
        message: "Internal server error",
    });
}