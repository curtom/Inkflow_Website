import { NextFunction, Request, Response } from "express";
import { AppError } from "../../common/utils/app-error";
import { successResponse } from "../../common/utils/api-response";
import { suggestCommunityTags } from "./community-classifier.service";

export async function suggestCommunityTagsController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        if (!req.user?.userId) {
            throw new AppError("Unauthorized", 401);
        }

        const { title, summary, content, tags } = req.body as {
            title: string;
            summary: string;
            content: string;
            tags?: string[];
        };

        const result = await suggestCommunityTags({
            title,
            summary,
            content,
            existingTags: tags ?? [],
        });

        res.status(200).json(
            successResponse("Community tag suggestions computed", result)
        );
    } catch (error) {
        next(error);
    }
}
