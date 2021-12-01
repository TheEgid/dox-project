import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UUIDv4 as uuid } from "uuid-v4-validator";
import TokenDto from "./token.dto";
import UserDto from "../user/user.dto";
import Token from "./token.entity";

@Injectable()
export default class TokenService {
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>
  ) {}

  private addSomeDays = (days: number): string => {
    return new Date(new Date().getTime() + 86400000 * days).toISOString(); // + days in ms;
  };

  async getTokenByUser(user: UserDto): Promise<Token | undefined> {
    try {
      return await this.tokenRepository
        .createQueryBuilder("token")
        .leftJoinAndSelect("user", "user", "token.userId = user.id")
        .where("user.id = :1", { 1: user.id })
        .orderBy("token.expiresIn", "DESC")
        .getOne();
    } catch (error) {
      return undefined;
    }
  }

  async updateToken(user: UserDto): Promise<TokenDto | undefined> {
    const checkedToken = await this.getTokenByUser(user);
    if (!(checkedToken instanceof TokenDto)) {
      return undefined;
    }
    if (Date.now() > Date.parse(checkedToken.expiresIn)) {
      return this.setToken(user, checkedToken.accessToken);
    }
    return checkedToken;
  }

  async setToken(user: UserDto, oldAccessToken?: string): Promise<Token | undefined> {
    try {
      const tokenDto: TokenDto = {
        id: new uuid().id,
        accessToken: oldAccessToken ? oldAccessToken : new uuid().id,
        refreshToken: new uuid().id,
        expiresIn: this.addSomeDays(2),
        userId: user,
      };
      await this.tokenRepository.save(tokenDto);
      return await this.tokenRepository.findOne(tokenDto.id);
    } catch (error) {
      return undefined;
    }
  }
}
