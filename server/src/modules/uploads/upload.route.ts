import { Router } from "express";
import { authMiddleware } from "../../common/middlewares/auth.middleware";
import { upload } from "../../common/middlewares/upload.middleware";
import { validate } from "../../common/middlewares/validate.middleware";
import { presignUploadController, uploadImageController } from "./upload.controller";
import { presignUploadSchema } from "./upload.schema";

const uploadRouter = Router();

uploadRouter.post(
    "/presign",
    authMiddleware,
    validate(presignUploadSchema),
    presignUploadController
);
uploadRouter.post("/image", authMiddleware, upload.single("file"), uploadImageController);

export default uploadRouter;