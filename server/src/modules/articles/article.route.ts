import {Router} from "express";
import {authMiddleware, optionalAuthMiddleware} from "../../common/middlewares/auth.middleware";
import {
    createArticleController, deleteArticleController,
    getArticleBySlugController,
    getArticlesController,
    updateArticleController
} from "./article.controller";
import {validate} from "../../common/middlewares/validate.middleware";
import {createArticleSchema, getArticleBySlugSchema, getArticleSchema, updateArticleSchema} from "./article.schema";
import commentRouter from "../comments/comment.route";
import reactionRouter from "../reactions/reaction.route";

const articleRouter = Router();

articleRouter.post("/", authMiddleware, validate(createArticleSchema), createArticleController );
articleRouter.get("/", optionalAuthMiddleware, validate(getArticleSchema), getArticlesController);
articleRouter.get("/:slug", optionalAuthMiddleware, validate(getArticleBySlugSchema), getArticleBySlugController);
articleRouter.patch(
    "/:slug",
    authMiddleware,
    validate(updateArticleSchema),
    updateArticleController
);
articleRouter.delete("/:slug", authMiddleware, deleteArticleController);
articleRouter.use("/:slug/comments", commentRouter);
articleRouter.use("/:slug/reactions", reactionRouter);

export default articleRouter;