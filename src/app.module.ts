import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { AppLoggerMiddleware, HealthcheckMiddleware } from "./app.middleware";
import AppController from "./app.controller";
import AppService from "./app.service";
import TokenModule from "./token/token.module";
import UserModule from "./user/user.module";
import AdminModule from "./admin/admin.module";
import DataBaseModule from "./database/database.module";
import DocumentModule from "./document/document.module";
import UploadDocModule from "./uploadDoc/uploadDoc.module";

@Module({
  imports: [UploadDocModule, DataBaseModule, UserModule, TokenModule, AdminModule, DocumentModule],
  controllers: [AppController],
  providers: [AppService],
})
export default class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AppLoggerMiddleware)
      .forRoutes("*")
      .apply(HealthcheckMiddleware)
      .forRoutes({ path: "status", method: RequestMethod.GET });
  }
}
