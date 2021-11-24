import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import UserModule from "../user/user.module";
import TokenModule from "../token/token.module";
import AdminMiddleware from "./admin.middleware";
import AdminController from "./admin.controller";
import AuthMiddleware from "../auth/auth.middleware";
import AdminService from "./admin.service";
// import DataBaseModule from "../database/database.module";

@Module({
  imports: [UserModule, TokenModule],
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
// @Module({
//   imports: [
//     TypeOrmModule.forFeature([Token]),
//     // PassportModule.register({ defaultStrategy: 'jwt' }),
//   ],
//   exports: [TokenService],
//   // controllers: [UserController],
//   providers: [TokenService],
// })
// export class TokenModule {}
