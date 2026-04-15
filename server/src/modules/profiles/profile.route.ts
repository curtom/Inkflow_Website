import { Router } from "express";
import { getPublicProfileController, getPublicProfileArticlesController } from "./profile.controller";


const profileRouter = Router();

profileRouter.get("/:username", getPublicProfileController);
profileRouter.get("/:username/articles", getPublicProfileArticlesController);

export default profileRouter;