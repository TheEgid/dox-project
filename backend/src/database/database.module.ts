import { TypeOrmModule } from "@nestjs/typeorm";
import { Logger, Module } from "@nestjs/common";
import dbConnectionOptions from "./database.config";

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: () => {
                try {
                    Logger.log(`[Database] ⛏ Postgres is running`);
                    return dbConnectionOptions;
                } catch (error) {
                    Logger.log("[Database] 🚧 Postgres Error: ".concat(error as string));
                }
            },
        }),
    ],
})
export default class DataBaseModule {}
