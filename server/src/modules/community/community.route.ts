import { Router } from "express";
import { authMiddleware } from "../../common/middlewares/auth.middleware";
import { validate } from "../../common/middlewares/validate.middleware";
import { suggestCommunityTagsSchema } from "./community.schema";
import { suggestCommunityTagsController } from "./community.controller";

const communityRouter = Router();

communityRouter.post(
    "/suggest-tags",
    authMiddleware,
    validate(suggestCommunityTagsSchema),
    suggestCommunityTagsController
);

export default communityRouter;
