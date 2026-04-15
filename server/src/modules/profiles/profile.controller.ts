import { Request, Response, NextFunction } from "express";
import { getPublicProfileByUsername, getPublicProfileArticles } from "./profile.service";
import { successResponse } from "../../common/utils/api-response";


export async function getPublicProfileController(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
     const { username } = req.params;
     const result = await getPublicProfileByUsername(username as string);

     res.status(200).json(successResponse("Public profile fetched successfully", result));
   } catch(error) {
    next(error);
   }
}

export async function getPublicProfileArticlesController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { username } = req.params;
        const page = typeof req.query.page === "string" ? Number(req.query.page) : 1;
        const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : 10;

        const result = await getPublicProfileArticles(username as string, page, limit);

        res.status(200).json(successResponse("Public profile articles fetched successfully", result));
    } catch(error) {
        next(error);
    }
}
