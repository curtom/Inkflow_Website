import { Router } from "express";
import { searchOverviewController } from "./search.controller";

const searchRouter = Router();

searchRouter.get("/", searchOverviewController);

export default searchRouter;