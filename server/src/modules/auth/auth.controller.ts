import { NextFunction, Request, Response } from 'express';
import { successResponse } from "../../common/utils/api-response";
import {getCurrentUser, loginUser, registerUser } from "./auth.service";
import { AppError } from "../../common/utils/app-error";

export async function registerController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const result = await registerUser(req.body);

        res.status(201).json(successResponse("Register success", result));
    }catch (error) {
        next(error);
    }
}

export async function loginController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const result = await loginUser(req.body);

        res.status(200).json(successResponse("Login success", result));
    }catch (error) {
        next(error);
    }
}

export async function getCurrentUserController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        if(!req.user?.userId) {
            throw new AppError("Unauthorized", 401);
        }

        const result = await getCurrentUser(req.user.userId);

        res.status(200).json(successResponse("Current user fetched", result));
    } catch (error) {
        next(error);
    }
}