import { ConnectionOptions } from "typeorm";
import User from "../user/user.entity";
import Token from "../token/token.entity";
import Document from "../document/document.entity";

const dbNames = {
  test: process.env.DB_NAME_TEST,
  dev: process.env.DB_NAME_DEV,
  prod: process.env.DB_NAME_PROD,
};

const envConfigure = () => {
  process.env.DB_NAME = <string>dbNames[process.env.NODE_ENV];
  switch (process.env.NODE_ENV) {
    case "test": {
      return {
        name: process.env.DB_NAME,
        port: 5432,
        username: process.env.DB_USER_TEST,
        password: process.env.DB_PASSWORD_TEST,
        database: process.env.DB_NAME_TEST,
        synchronize: true,
        logging: false,
      };
    }
    case "dev": {
      return {
        name: process.env.DB_NAME,
        port: 5432,
        username: process.env.DB_USER_DEV,
        password: process.env.DB_PASSWORD_DEV,
        database: process.env.DB_NAME_DEV,
        synchronize: true,
        logging: true,
      };
    }
    case "prod": {
      return {
        name: process.env.DB_NAME,
        port: 5432,
        username: process.env.DB_USER_PROD,
        password: process.env.DB_PASSWORD_PROD,
        database: process.env.DB_NAME_PROD,
        synchronize: false,
        logging: true,
      };
    }
  }
};

const dbOptions: ConnectionOptions = {
  entities: [User, Token, Document],
  type: "postgres",
};

const configureConnection = () => {
  return Object.assign(dbOptions, envConfigure());
};

export default configureConnection;
