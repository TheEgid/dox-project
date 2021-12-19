import { Logger } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import dbConnectionOptions from "./database.config";

const DataBaseModule = TypeOrmModule.forRootAsync({
  useFactory: () => {
    try {
      Logger.log(`[Database] ⛏ Postgres is running`);
      return dbConnectionOptions;
    } catch (error) {
      Logger.log("[Database] 🚧 Postgres Error: ".concat(error as string));
    }
  },
});

export default DataBaseModule;
