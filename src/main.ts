import { NestFactory } from "@nestjs/core";
import fs from "fs";
import AppModule from "./app.module";
import { Logger } from "@nestjs/common";

const { NODE_ENV } = process.env;

if (!NODE_ENV || !fs.existsSync(".env")) {
  throw new Error("NODE_ENV required");
}

const port = Number(process.env.SERVER_PORT);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  await app.listen(port);
}

bootstrap()
  .then(() => {
    Logger.log(`[Info] ➤ port:${port} ⚙ ${String(process.env.NODE_ENV)} ⚙ environment`);
  })
  .catch((error) => {
    Logger.error("[Error] ➤ ".concat(error as string));
  });

// @Get("/")
// // Протестировано добавление заголовков
// @Header("Access-Control-Allow-Origin", "*")
// @Header(
//   "Access-Control-Allow-Headers",
//   "Origin, X-Requested-With, Content-Type, Accept, X-Access-Token"
// )
// getStart() {
//   return { message: "Server is running" };
// }
