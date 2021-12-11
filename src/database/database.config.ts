import { ConnectionOptions } from "typeorm";
import User from "../user/user.entity";
import Token from "../token/token.entity";
import Document from "../document/document.entity";

const configConnection = () => {
  switch (process.env.NODE_ENV) {
    case "test": {
      process.env.DB_NAME = process.env.DB_NAME_TEST;
      return {
        name: process.env.DB_NAME_TEST,
        url: process.env.DB_URL_TEST,
        synchronize: true,
      };
    }
    case "dev": {
      process.env.DB_NAME = process.env.DB_NAME_DEV;
      return {
        name: process.env.DB_NAME_DEV,
        url: process.env.DB_URL_DEV,
        synchronize: true,
      };
    }
    case "prod": {
      process.env.DB_NAME = process.env.DB_NAME_PROD;
      return {
        name: process.env.DB_NAME_PROD,
        url: process.env.DB_URL_PROD,
        synchronize: false,
      };
    }
  }
};

const connectionOptions: ConnectionOptions = {
  entities: [User, Token, Document],
  type: "postgres",
  logging: true,
};

export { connectionOptions, configConnection };
