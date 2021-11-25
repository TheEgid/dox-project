import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { v4 as uuid } from "uuid";
import User from "../user/user.entity";
import Token from "./token.entity";
import { TokenDTO } from "./token.dto";

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
    const oldToken = await this.getTokenByUser(user);
    if (!(oldToken instanceof Token && Date.now() < Date.parse(oldToken.expiresIn))) {
      const id = oldToken.id;
      const updatedToken: TokenDTO = {
        accessToken: oldToken.accessToken,
        refreshToken: uuid(),
        expiresIn: this.addSomeDays(2),
        userId: user,
      };
      await this.tokenRepository.update(id, updatedToken);
      return this.tokenRepository.findOne(id);
    }
    return oldToken;
  }

  async setToken(user: User): Promise<void> {
    const oldToken = await this.getTokenByUser(user);
    if (!(oldToken instanceof Token)) {
      const token: Token = this.tokenRepository.create({
        id: uuid(),
        accessToken: uuid(),
        refreshToken: uuid(),
        expiresIn: this.addSomeDays(2),
        userId: user,
      });
      await this.tokenRepository.save(token);
    }
  }

  // async findByToken(token: string): Promise<Token | undefined> {
  //   return this.DbConnection().getRepository(Token).findOne({ where: { token } });
  // }
}
