import { getConnection } from "typeorm";
import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { configConnection, connectionOptions } from "../src/database/database.config";
import AppModule from "../src/app.module";

const databaseStringAccidentCheck = () => {
  if (process.env.DB_NAME !== "doc-flow-test") {
    throw new Error(`The test database ${process.env.DB_NAME} is the same as the main database.`);
  }
};

const createModuleFixture = async () => {
  const workTestingModule = Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot(
        Object.assign(
          connectionOptions,
          {
            logging: false,
          },
          configConnection()
        )
      ),
      AppModule,
    ],
  }).compile();
  databaseStringAccidentCheck();
  return workTestingModule;
};

const initializeBefore = async () => {
  const moduleFixture = await createModuleFixture();
  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix("api");
  await app.init();
  return app;
};

const finalizeAfter = async (target: string) => {
  const repository = getConnection(process.env.DB_NAME).getRepository(target);
  await repository.query(`TRUNCATE TABLE public."${target.toLowerCase()}" CASCADE`);
};

export { initializeBefore, finalizeAfter };
