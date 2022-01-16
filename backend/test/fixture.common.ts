import { getConnection } from "typeorm";
import { Test } from "@nestjs/testing";
import AppModule from "../src/app.module";
import DataBaseModule from "../src/database/database.module";

export interface IErrorRequest {
    statusCode: number;
    message: string;
    error: string;
}

const databaseStringAccidentCheck = () => {
    const dbName = process.env.DB_NAME_TEST;
    if (dbName !== "doc-flow-test") {
        throw new Error(`The test database ${dbName} is not the test database.`);
    }
};

const createModuleFixture = async () => {
    const workTestingModule = await Test.createTestingModule({
        imports: [DataBaseModule, AppModule],
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
