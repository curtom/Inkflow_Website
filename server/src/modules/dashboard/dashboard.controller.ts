import { NextFunction, Request, Response } from "express";
import { AppError } from "../../common/utils/app-error";
import { successResponse } from "../../common/utils/api-response";
import { getDashboardHistory, getDashboardOverview, getDashboardSocial } from "./dashboard.service";

export async function getDashboardOverviewController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user?.userId) {
      throw new AppError("Unauthorized", 401);
    }

    const month = typeof req.query.month === "string" ? Number(req.query.month) : undefined;
    const result = await getDashboardOverview(req.user.userId, month);
    res.status(200).json(successResponse("Dashboard overview fetched successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function getDashboardSocialController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user?.userId) {
      throw new AppError("Unauthorized", 401);
    }

    const result = await getDashboardSocial(req.user.userId);
    res.status(200).json(successResponse("Dashboard social data fetched successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function getDashboardHistoryController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user?.userId) {
      throw new AppError("Unauthorized", 401);
    }

    const page = typeof req.query.page === "string" ? Number(req.query.page) : 1;
    const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : 20;
    const result = await getDashboardHistory(req.user.userId, page, limit);
    res.status(200).json(successResponse("Dashboard history fetched successfully", result));
  } catch (error) {
    next(error);
  }
}
