import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import User from "./user.entity";
import UserController from "./user.controller";
import UserService from "./user.service";
import { AuthMiddleware } from "../auth/auth.middleware";
import TokenService from "../token/token.service";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  exports: [UserService],
  controllers: [UserController],
  providers: [UserService, TokenService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: '"/api/latency"', method: RequestMethod.GET },
        { path: "/api/info", method: RequestMethod.GET }
      );
  }
}

//.forRoutes(OrderController);
