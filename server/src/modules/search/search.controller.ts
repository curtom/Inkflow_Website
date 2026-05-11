import { NextFunction, Request, Response } from "express";
import { successResponse } from "../../common/utils/api-response";
import { AppError } from "../../common/utils/app-error";
import { searchOverview } from "./search.service";

const MAX_SEARCH_KEYWORD_LENGTH = 100;

export async function searchOverviewController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
      const keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim() : "";

      if(!keyword) {
        return res.status(200).json(
            successResponse("Search result fetched successfully", {
              stories: [],
              users: [],
              tags: [],
            })
          );
        }

        if (keyword.length > MAX_SEARCH_KEYWORD_LENGTH) {
          throw new AppError(`keyword must be at most ${MAX_SEARCH_KEYWORD_LENGTH} characters`, 400);
        }

        const result = await searchOverview(keyword);
       
        res.status(200).json(successResponse("Search result fetched successfully", result));
    }catch (error) {
        next(error);
    };
}