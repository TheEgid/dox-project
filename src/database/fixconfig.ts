import * as fs from "fs";
import dbConnectionOptions from "./database.config";
import path from "path";

const migrationParams = {
  name: "",
  migrations: [path.join(__dirname, "/../../migrations") + "/*.ts"],
  cli: {
    migrationsDir: path.join(__dirname, "/../../migrations"),
  },
};

fs.writeFileSync(
  "ormconfig.json",
  JSON.stringify(Object.assign(dbConnectionOptions, migrationParams), null, 4)
);
