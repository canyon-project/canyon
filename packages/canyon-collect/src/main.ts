import { NestFactory } from "@nestjs/core";
import { json } from "express";
import * as dotenv from "dotenv";
import * as path from "node:path";
import { ValidationPipe } from "@nestjs/common";
dotenv.config({
    path: path.resolve(__dirname, "../../../.env"),
});

// flag position, do not delete

async function bootstrap() {
    const { AppModule } = await import("./app.module");
    const app = await NestFactory.create(AppModule);
    app.use(
        json({
            limit: "50mb",
        }),
    );
    app.useGlobalPipes(new ValidationPipe());
    app.enableCors();
    await app.listen(8080);
}
bootstrap();
