import app from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/db";

async function bootstrap() {
    await connectDB();

    app.listen(env.port, () => {
        console.log(`Server started on port ${env.port}`);
    });
}

bootstrap();