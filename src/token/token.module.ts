import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import Token from "./token.entity";
import TokenService from "./token.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Token]),
    // PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  exports: [TokenService],
  // controllers: [UserController],
  providers: [TokenService],
})
export default class TokenModule {}
