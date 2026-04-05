import { NextFunction, Request, Response } from "express";
import {AppError} from "../../common/utils/app-error";
import {createArticle, deleteArticle, getArticleBySlug, getArticles, updateArticle} from "./article.service";
import {successResponse} from "../../common/utils/api-response";

export async function createArticleController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        if(!req.user?.userId) {
            throw new AppError('Unauthorized', 401);
        }

        const result = await createArticle(req.user.userId, req.body);

        res.status(201).json(successResponse("Article created successfully", result));
    }catch (error) {
        next(error);
    }
}

export async function getArticlesController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const page = typeof req.query.page === 'string' ? Number(req.query.page) : undefined;
        const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined;

        const result = await getArticles({page, limit});
        res.status(200).json(successResponse("Articles fetched successfully", result));
    }catch (error) {
        next(error);
    }
}

export async function getArticleBySlugController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
       const { slug } = req.params;
       const result = await getArticleBySlug(slug as string);

       res.status(200).json(successResponse("Article fetched successfully", result));
    }catch (error) {
        next(error);
    }
}

export async function updateArticleController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        if(!req.user?.userId) {
            throw new AppError('Unauthorized', 401);
        }
        const { slug } = req.params;
        const result = await updateArticle(req.user.userId, slug as string, req.body);

        res.status(200).json(successResponse("Article updated successfully", result));
    }catch(error) {
        next(error);
    }
}

export async function deleteArticleController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        if (!req.user?.userId) {
            throw new AppError("Unauthorized", 401);
        }

        const { slug } = req.params;
        const result = await deleteArticle(req.user.userId, slug as string);

        res.status(200).json(successResponse("Article deleted successfully", result));
    } catch (error) {
        next(error);
    }
}