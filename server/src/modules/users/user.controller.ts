import { NextFunction, Request, Response } from "express";
import { AppError } from "../../common/utils/app-error";
import { getCurrentUserProfile, updateCurrentUserProfile } from "./user.service";
import { successResponse } from "../../common/utils/api-response";


export async function getCurrentUserProfileController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try{
        if(!req.user?.userId) {
            throw new AppError("Unauthorized", 401);
        }
        const result = await getCurrentUserProfile(req.user.userId);
        res.status(200).json(successResponse("Current user profile fetched", result));
    } catch(error){
        next(error);
    }
}

export async function updateCurrentUserProfileController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        if (!req.user?.userId) {
            throw new AppError("Unauthorized", 401);
        }

        const result = await updateCurrentUserProfile(req.user.userId, req.body);

        res.status(200).json(successResponse("Profile updated successfully", result));
    } catch (error) {
        next(error);
    }
}