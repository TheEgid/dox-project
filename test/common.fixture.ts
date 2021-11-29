import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { configConnection, connectionOptions } from "../src/database/database.config";
import AppModule from "../src/app.module";

const databaseStringAccidentCheck = () => {
  if (process.env.DB_NAME !== "doc-flow-test") {
    console.error(process.env.DB_NAME);
    console.error("The test database is the same as the main database. This might be a mistake.");
    process.exit(1);
  }
};

export const createModuleFixture = async () => {
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
