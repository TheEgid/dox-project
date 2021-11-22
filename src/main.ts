import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger } from "@nestjs/common";

const port = process.env.SERVER_PORT as unknown as number;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  // app.useGlobalFilters(new ExceptionFilter());
  await app.listen(port);
}

bootstrap()
  .then(() => {
    Logger.log(`[Info] ➤ port:${port} ⚙ ${process.env.APP_ENV} ⚙ environment`);
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
