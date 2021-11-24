import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import AppController from "./app.controller";
import AppService from "./app.service";
import { AppLoggerMiddleware, HealthcheckMiddleware } from "./app.middleware";
import TokenModule from "./token/token.module";
import UserModule from "./user/user.module";
import AdminModule from "./admin/admin.module";
import DataBaseModule from "./database/database.module";

@Module({
  imports: [DataBaseModule, UserModule, TokenModule, AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export default class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AppLoggerMiddleware)
      .forRoutes("*")
      .apply(HealthcheckMiddleware)
      .forRoutes({ path: "/api/status/", method: RequestMethod.GET });
  }
}
