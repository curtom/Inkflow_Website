import { Router } from "express";
import authRouter from "../modules/auth/auth.route";
import userRouter from "../modules/users/user.route";
import articleRouter from "../modules/articles/article.route";
import uploadRouter from "../modules/uploads/upload.route";

const router = Router();

router.get("/health", (_req, res) => {
    res.status(200).json({
        message: "Server is running",
    });
});

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/articles", articleRouter);
router.use("/uploads", uploadRouter);

export default router;