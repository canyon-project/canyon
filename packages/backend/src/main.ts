import path from "node:path";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import * as dotenv from "dotenv";

dotenv.config({
	path: [
		path.resolve(__dirname, "../../../.env"),
		path.resolve(__dirname, "../.env"),
	],
});

async function bootstrap(): Promise<void> {
	const { AppModule } = await import("./app.module.js");
	const app = await NestFactory.create<NestExpressApplication>(AppModule);
	const port = 8080;
	app.enableCors();
	await app.listen(port);
}

bootstrap();
