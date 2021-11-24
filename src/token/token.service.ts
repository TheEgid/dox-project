import { getConnection } from "typeorm";
import User from "../user/user.entity";
import Token from "./token.entity";
import TokenRepository from "./token.repository";

export default class TokenService {
  private readonly DbConnection = () => getConnection(process.env.DB_NAME);

  async getUserByToken(refreshToken: string): Promise<User> {
    return this.DbConnection()
      .getRepository(User)
      .createQueryBuilder("user")
      .leftJoinAndSelect("token", "token", "token.userId = user.id")
      .where("token.refreshToken = :1", { 1: refreshToken })
      .getOne();
  }

  async getTokenByUser(user: User): Promise<Token> {
    return this.DbConnection()
      .getRepository(Token)
      .createQueryBuilder("token")
      .leftJoinAndSelect("user", "user", "token.userId = user.id")
      .where("user.id = :1", { 1: user.id })
      .orderBy("token.expiresIn", "DESC")
      .getOne();
  }

  async setToken(user: User): Promise<void> {
    const oldToken = await this.getTokenByUser(user);
    if (!(oldToken instanceof Token && Date.now() - Date.parse(oldToken.expiresIn) < 0)) {
      const token: TokenRepository = new TokenRepository();
      await token.generate(user);
    }
  }
}
