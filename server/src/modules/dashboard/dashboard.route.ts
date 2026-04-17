import { Router } from "express";
import { authMiddleware } from "../../common/middlewares/auth.middleware";
import { validate } from "../../common/middlewares/validate.middleware";
import {
  getDashboardHistoryController,
  getDashboardOverviewController,
  getDashboardSocialController,
} from "./dashboard.controller";
import {
  getDashboardHistorySchema,
  getDashboardOverviewSchema,
  getDashboardSocialSchema,
} from "./dashboard.schema";

const dashboardRouter = Router();

dashboardRouter.get(
  "/overview",
  authMiddleware,
  validate(getDashboardOverviewSchema),
  getDashboardOverviewController
);
dashboardRouter.get(
  "/social",
  authMiddleware,
  validate(getDashboardSocialSchema),
  getDashboardSocialController
);
dashboardRouter.get(
  "/history",
  authMiddleware,
  validate(getDashboardHistorySchema),
  getDashboardHistoryController
);

export default dashboardRouter;
