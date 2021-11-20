import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import User from "./user.entity";
import UserController from "./user.controller";
// import { PassportModule } from '@nestjs/passport';
import UserService from "./user.service";
import * as argon2 from "argon2";


@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    // PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  exports: [UserService],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
