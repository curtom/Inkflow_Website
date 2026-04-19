import { Router } from "express";
import { authMiddleware } from "../../common/middlewares/auth.middleware";
import { validate } from "../../common/middlewares/validate.middleware";
import {
  getDashboardHistoryController,
  getDashboardNotificationsController,
  getDashboardOverviewController,
  getDashboardSocialController,
  getNotificationsUnreadController,
  markNotificationsViewedController,
} from "./dashboard.controller";
import {
  getDashboardHistorySchema,
  getDashboardNotificationsSchema,
  getDashboardOverviewSchema,
  getDashboardSocialSchema,
  getNotificationsUnreadSchema,
  markNotificationsViewedSchema,
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
  "/notifications",
  authMiddleware,
  validate(getDashboardNotificationsSchema),
  getDashboardNotificationsController
);
dashboardRouter.get(
  "/notifications/unread",
  authMiddleware,
  validate(getNotificationsUnreadSchema),
  getNotificationsUnreadController
);
dashboardRouter.post(
  "/notifications/mark-viewed",
  authMiddleware,
  validate(markNotificationsViewedSchema),
  markNotificationsViewedController
);
dashboardRouter.get(
  "/history",
  authMiddleware,
  validate(getDashboardHistorySchema),
  getDashboardHistoryController
);

export default dashboardRouter;
