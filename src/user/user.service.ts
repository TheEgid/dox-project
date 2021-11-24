import { getConnection } from "typeorm";
import { Injectable } from "@nestjs/common";
import { Request } from "express";
import UsersRepository from "./user.repository";
import User from "./user.entity";
import Token from "../token/token.entity";
import TokenService from "../token/token.service";
import TokenRepository from "../token/token.repository";

@Injectable()
export default class UserService {
  constructor(private readonly tokenService: TokenService) {}

  private readonly DbConnection = () => getConnection(process.env.DB_NAME);

  // Регистрация
  async userSignup(newUser: User): Promise<Token> {
    const userRepo = this.DbConnection().getCustomRepository(UsersRepository);
    const userRepeat = await userRepo.findByEmail(newUser.email);
    if (!(userRepeat instanceof User)) {
      await userRepo.save(newUser);
      await this.tokenService.setToken(newUser);
      return this.tokenService.getTokenByUser(newUser);
    }
    return undefined;
  }

  // Вход
  async userSignin(user: User): Promise<Token> {
    const userRepo = this.DbConnection().getCustomRepository(UsersRepository);
    const oldUser = await userRepo.findByEmailHashedPassword(user.email, user.hashedPassword);
    if (oldUser instanceof User) {
      await this.tokenService.setToken(oldUser);
      return this.tokenService.getTokenByUser(oldUser);
    }
    return undefined;
  }

  async userLogout(req: Request): Promise<void> {
    const TokenRepo = this.DbConnection().getCustomRepository(TokenRepository);
    if (req.get(process.env.HEADER_AUTH)) {
      const [, token] = req.headers.authorization.split(" ", 2);
      await TokenRepo.remove(token);
    } else {
      return undefined;
    }
    return null;
  }

  async getUserInfo(req: Request): Promise<User> {
    if (req.get(process.env.HEADER_AUTH)) {
      const [, token] = req.headers.authorization.split(" ", 2);
      return this.tokenService.getUserByToken(token);
    }
    return null;
  }

  // async deleteLastUser(): Promise<void> {
  //   const UserRepo = this.DbConnection().getCustomRepository(UsersRepository);
  //   await UserRepo.removeLast();
  // }
}

// const repository = getMongoRepository(User);
// // Поиск по текущему токену
// const user = await this.findUser(req, repository);
//
// if (all) {
//   // Если true удаляем(заменяем пустыми, что тоже так себе. Опять же тупо с Mongo не очень удобно работать, так проще всего было. Так метод Update юзал) все токены
//   user.token.accessToken = process.env.GET_LOGOUT_TOKEN;
//   user.token.refreshToken = process.env.GET_LOGOUT_TOKEN;
//   return await TokenService.getUserByToken(token);
//   // repository.save(user);
// } else {
//   // Если false удаляем только текущий
//   user.token.accessToken = process.env.GET_LOGOUT_TOKEN;
//   // Сохраняем изменения
//   repository.save(user);
// }
