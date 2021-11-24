import { Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { configConnection, connectionOptions } from "./database.config";

const appConfigModule = ConfigModule.forRoot({
  envFilePath: [".env"],
});

const ormModule = TypeOrmModule.forRootAsync({
  imports: [appConfigModule],
  useFactory: () => {
    try {
      Logger.log(`[Database] ⛏ Postgres is running`);
      return Object.assign(connectionOptions, configConnection()) as PostgresConnectionOptions;
    } catch (error) {
      Logger.log("[Database] 🚧 Postgres Error: ".concat(error as string));
    }
  },
});

@Module({ imports: [appConfigModule, ormModule] })
export default class DataBaseModule {}
