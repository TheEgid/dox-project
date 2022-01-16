import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import UserModule from "../user/user.module";
import TokenModule from "../token/token.module";
import AdminMiddleware from "./admin.middleware";
import AdminController from "./admin.controller";
import AuthMiddleware from "../auth/auth.middleware";
import AdminService from "./admin.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import User from "../user/user.entity";
import Token from "../token/token.entity";

@Module({
    imports: [UserModule, TokenModule, TypeOrmModule.forFeature([User, Token])],
    controllers: [AdminController],
    providers: [AdminService],
})
export default class AdminModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AdminMiddleware)
            .forRoutes(AdminController)
            .apply(AuthMiddleware)
            .forRoutes(AdminController);
    }
}
