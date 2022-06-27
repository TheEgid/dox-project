import path from "path";
import * as dotenv from "dotenv";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { DataSourceOptions } from "typeorm";

dotenv.config({ path: ".env" });

const dbNames = {
    test: process.env.DB_NAME_TEST,
    dev: process.env.DB_NAME_DEV,
    prod: process.env.DB_NAME_PROD,
};

process.env.DB_NAME = <string>dbNames[process.env.NODE_ENV];

const dbOptions = {
    test: {
        username: process.env.DB_USER_TEST,
        password: process.env.DB_PASSWORD_TEST,
        database: process.env.DB_NAME_TEST,
        synchronize: true,
        logging: false,
    },
    dev: {
        username: process.env.DB_USER_DEV,
        password: process.env.DB_PASSWORD_DEV,
        database: process.env.DB_NAME_DEV,
        synchronize: true,
        logging: true,
    },
    prod: {
        username: process.env.DB_USER_PROD,
        password: process.env.DB_PASSWORD_PROD,
        database: process.env.DB_NAME_PROD,
        synchronize: false,
        logging: true,
    },
};

const dbCommonOptions: DataSourceOptions = {
    entities: [path.join(__dirname, "..", "/**/*.entity.{ts,js}")], //[User, Token, Document],
    type: "postgres",
    host: process.platform === "linux" ? "postgres" : "localhost",
    port: 5432,
    name: process.env.DB_NAME,
    migrations: [path.join(__dirname, "..", "database", "migrations") + path.sep + "*.ts"],
};

const dbConnectionOptions = <PostgresConnectionOptions>{
    ...dbCommonOptions,
    ...dbOptions[process.env.NODE_ENV],
};

export default dbConnectionOptions;
