import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger } from "@nestjs/common";

const port = process.env.SERVER_PORT as unknown as number;

async function bootstrap(): Promise<void> {
  process.env.NO_COLOR = String(true);
  const app = await NestFactory.create(AppModule);
  await app.listen(port);
}

bootstrap()
  .then(() => {
    Logger.log(`[Info] ➤ port:${port} ⚙ ${process.env.APP_ENV} ⚙ environment`);
  })
  .catch((error) => {
    Logger.error("[Error] ➤ ".concat(error as string));
  });
