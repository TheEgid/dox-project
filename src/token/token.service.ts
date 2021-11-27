import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UUIDv4 as uuid } from "uuid-v4-validator";
import { CreateTokenDto, TokenDTO, UpdateTokenDto } from "./token.dto";
import User from "../user/user.entity";
import Token from "./token.entity";

@Injectable()
export default class UserService {
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>
  ) {}

  private addSomeDays = (days: number): string => {
    return new Date(new Date().getTime() + 86400000 * days).toISOString(); // + days in ms;
  };

  async getTokenByUser(user: User): Promise<Token> {
    return this.tokenRepository
      .createQueryBuilder("token")
      .leftJoinAndSelect("user", "user", "token.userId = user.id")
      .where("user.id = :1", { 1: user.id })
      .orderBy("token.expiresIn", "DESC")
      .getOne();
  }

  async updateToken(user: User): Promise<Token | undefined> {
    const updateTokenDto: UpdateTokenDto = await this.getTokenByUser(user);
    if (!(updateTokenDto instanceof Token && Date.now() < Date.parse(updateTokenDto.expiresIn))) {
      const id = updateTokenDto.id;
      const tokenDTO: TokenDTO = {
        accessToken: updateTokenDto.accessToken,
        refreshToken: new uuid().id,
        expiresIn: this.addSomeDays(2),
        userId: user,
      };
      await this.tokenRepository.update(id, tokenDTO);
      return this.tokenRepository.findOne(id);
    }
    return updateTokenDto;
  }

  async setToken(user: User): Promise<void> {
    const oldToken = await this.getTokenByUser(user);
    if (!(oldToken instanceof Token)) {
      const createTokenDto: CreateTokenDto = {
        accessToken: new uuid().id,
        refreshToken: new uuid().id,
        expiresIn: this.addSomeDays(2),
        userId: user,
      };
      await this.tokenRepository.save(createTokenDto);
    }
  }
}
