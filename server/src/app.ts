import express from "express";
import cors from "cors";
import routes from "./routes";
import { errorMiddleware } from "./common/middlewares/error.middleware";
import { env } from "./config/env";

const app = express();

app.use(
    cors({
        origin: env.clientOrigins,
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", routes);
app.use(errorMiddleware);

export default app;