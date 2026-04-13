import { Router } from "express";
import { authMiddleware } from "../../common/middlewares/auth.middleware";
import { upload } from "../../common/middlewares/upload.middleware";
import { uploadImageController } from "./upload.controller";

const uploadRouter = Router();

uploadRouter.post("/image", authMiddleware, upload.single("file"), uploadImageController);

export default uploadRouter;