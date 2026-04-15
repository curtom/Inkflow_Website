import { NextFunction, Request, Response } from "express";
import { successResponse } from "../../common/utils/api-response";
import { searchOverview } from "./search.service";

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

        const result = await searchOverview(keyword);
       
        res.status(200).json(successResponse("Search result fetched successfully", result));
    }catch (error) {
        next(error);
    };
}