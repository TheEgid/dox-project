import { Test } from "@nestjs/testing";
import AppModule from "../src/app.module";
import { DataSource } from "typeorm";
import { INestApplication } from "@nestjs/common";

export interface IErrorRequest {
    statusCode: number;
    message: string;
    error: string;
}

let app: INestApplication;
let appDataSource: DataSource;

const databaseStringAccidentCheck = () => {
    const dbName = process.env.DB_NAME_TEST;
    if (dbName !== "doc-flow-test") {
        throw new Error(`The test database ${dbName} is not the test database.`);
    }
};

const createModuleFixture = async () => {
    const workTestingModule = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();
    databaseStringAccidentCheck();
    return workTestingModule;
};

const initializeBefore = async () => {
    const moduleFixture = await createModuleFixture();
    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api");
    await app.init();
    appDataSource = app.get(DataSource);
    return app;
};

const finalizeAfter = async (target: string) => {
    const repository = appDataSource.getRepository(target);
    await repository.query(`TRUNCATE TABLE public."${target.toLowerCase()}" CASCADE`);
};

export { initializeBefore, finalizeAfter, createModuleFixture };
