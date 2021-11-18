import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as morgan from "morgan";
import { ConfigModule } from "@nestjs/config";

ConfigModule.forRoot({
  envFilePath: ".env",
});

const port = process.env.SERVER_PORT as unknown as number;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.use(morgan("dev"));
  await app.listen(port);
}

bootstrap()
  .then(() => {
    console.log(`➤ ➤ ➤ port ${port}`);
  })
  .catch((error) => {
    console.log("Error: ".concat(error as string));
  });
