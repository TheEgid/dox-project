import * as fs from "fs";
import dbConnectionOptions from "./database.config";
import path from "path";

const migrationsDir = path.join(__dirname, "..", "database", "migrations");

const migrationParams = {
    name: "",
    migrations: [migrationsDir + path.sep + "*.ts"],
    cli: {
        migrationsDir: path.join("src", "database", "migrations"),
    },
};

fs.writeFileSync(
    "ormconfig.json",
    JSON.stringify(Object.assign(dbConnectionOptions, migrationParams), null, 4)
);
