import { Logger, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import configureConnection from "./database.config";

const ormModule = TypeOrmModule.forRootAsync({
  useFactory: () => {
    try {
      Logger.log(`[Database] ⛏ Postgres is running`);
      return configureConnection() as PostgresConnectionOptions;
    } catch (error) {
      Logger.log("[Database] 🚧 Postgres Error: ".concat(error as string));
    }
  },
});

@Module({ imports: [ormModule] })
export default class DataBaseModule {}
