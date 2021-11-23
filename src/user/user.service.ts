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

  // static async getUsers(): Promise<User[]> {
  //   return await getCustomRepository(UsersRepository).findAll();
  // }

  // Регистрация
  async userSignup(newUser: User): Promise<Token> {
    const userRepo = getConnection(process.env.DB_NAME).getCustomRepository(UsersRepository);
    const userRepeat = await userRepo.findByEmail(newUser.email);
    if (!(userRepeat instanceof User)) {
      await userRepo.save(newUser);
      await this.tokenService.setToken(newUser);
      return await this.tokenService.getTokenByUser(newUser);
    } else {
      return undefined;
    }
  }

  // Вход
  async userSignin(user: User): Promise<Token> {
    const userRepo = getConnection(process.env.DB_NAME).getCustomRepository(UsersRepository);
    const oldUser = await userRepo.findByEmailHashedPassword(user.email, user.hashedPassword);
    if (oldUser instanceof User) {
      await this.tokenService.setToken(oldUser);
      return await this.tokenService.getTokenByUser(oldUser);
    } else {
      return undefined;
    }
  }

  async userLogout(req: Request): Promise<void> {
    const TokenRepo = getConnection(process.env.DB_NAME).getCustomRepository(TokenRepository);
    if (req.get(process.env.HEADER_AUTH)) {
      const [, token] = req.headers.authorization.split(" ", 2);
      await TokenRepo.remove(token);
    } else {
      return undefined;
    }
  }

  async getUserInfo(req: Request): Promise<User> {
    if (req.get(process.env.HEADER_AUTH)) {
      const [, token] = req.headers.authorization.split(" ", 2);
      return await this.tokenService.getUserByToken(token);
    }
  }
  // async deleteLastUser(): Promise<void> {
  //   const UserRepo = getConnection(process.env.DB_NAME).getCustomRepository(UsersRepository);
  //   await UserRepo.removeLast();
  // }
}

// const usersRepository = getConnection(process.env.DB_NAME).getCustomRepository(UsersRepository);
// if (req.get(process.env.HEADER_AUTH)) {
// const [, token] = req.headers.authorization.split(" ", 2);
// const curUser = await usersRepository.findByToken(token);
// await usersRepository.remove(curUser);

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
