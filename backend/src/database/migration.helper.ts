import { DataSource } from "typeorm";
import dbConnectionOptions from "./database.config";

export const connectionSource = new DataSource({
    ...dbConnectionOptions,
});
