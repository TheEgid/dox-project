import { Logger, MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { connectionOptions, configConnection } from "./database/database.config";
import AppController from "./app.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppService } from "./app.service";
import { AppLoggerMiddleware, HealthcheckMiddleware } from "./app.middleware";
import { ConfigModule } from "@nestjs/config";
import TokenModule from "./token/token.module";
import UserModule from "./user/user.module";
import AdminModule from "./admin/admin.module";

const appConfigModule = ConfigModule.forRoot({
  envFilePath: [".env"],
});

const ormModule = TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: () => {
    try {
      Logger.log(`[Database] ⛏ Postgres is running`);
      return Object.assign(connectionOptions, configConnection());
    } catch (error) {
      Logger.log("[Database] 🚧 Postgres Error: ".concat(error as string));
    }
  },
});

@Module({
  imports: [appConfigModule, ormModule, UserModule, TokenModule, AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AppLoggerMiddleware)
      .forRoutes("*")
      .apply(HealthcheckMiddleware)
      .forRoutes({ path: "/api/status/", method: RequestMethod.GET });
  }
}
