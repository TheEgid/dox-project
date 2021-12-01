import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import User from "./user.entity";
import UserController from "./user.controller";
import UserService from "./user.service";
import TokenService from "../token/token.service";
import AuthMiddleware from "../auth/auth.middleware";
import Token from "../token/token.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User, Token])],
  exports: [UserService],
  controllers: [UserController],
  providers: [UserService, TokenService],
})
export default class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: "auth/logout", method: RequestMethod.GET },
        { path: "auth/info", method: RequestMethod.GET }
      );
  }
}
