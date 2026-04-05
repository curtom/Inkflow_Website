import {Router} from "express";
import {authMiddleware} from "../../common/middlewares/auth.middleware";
import {
    createArticleController, deleteArticleController,
    getArticleBySlugController,
    getArticlesController,
    updateArticleController
} from "./article.controller";
import {validate} from "../../common/middlewares/validate.middleware";
import {createArticleSchema, getArticleBySlugSchema, getArticleSchema, updateArticleSchema} from "./article.schema";

const articleRouter = Router();

articleRouter.post("/", authMiddleware, validate(createArticleSchema), createArticleController );
articleRouter.get("/", validate(getArticleSchema), getArticlesController);
articleRouter.get("/:slug", validate(getArticleBySlugSchema), getArticleBySlugController);
articleRouter.patch(
    "/:slug",
    authMiddleware,
    validate(updateArticleSchema),
    updateArticleController
);
articleRouter.delete("/:slug", authMiddleware, deleteArticleController);

export default articleRouter;