import { getConnection, getCustomRepository } from "typeorm";
// import { Request } from "express";
import UsersRepository from "./user.repository";
import { IPingResult, ping } from "@network-utils/tcp-ping";
import User from "./user.entity";
import Token from "../token/token.entity";
import TokenService from "../token/token.service";

export default class UserService {
  static async getUsers(): Promise<User[]> {
    return await getCustomRepository(UsersRepository).findAll();
  }

  // Регистрация
  async userSignup(newUser: User): Promise<Token> {
    const usersRepository = getConnection(process.env.DB_NAME).getCustomRepository(UsersRepository);
    const userRepeat = await usersRepository.findByEmail(newUser.email);
    if (!(userRepeat instanceof User)) {
      await usersRepository.save(newUser);
      await TokenService.setToken(newUser);
      return await TokenService.getTokenByUser(newUser);
    } else {
      return undefined;
    }
  }

  // // Вход
  // async userSignin(user: User): Promise<Token> {
  //   const usersRepository = getConnection(process.env.DB_NAME).getCustomRepository(UsersRepository);
  //   const oldUser = await usersRepository.findByEmailHashedPassword(
  //     user.email,
  //     user.hashedPassword
  //   );
  //   if (oldUser instanceof User) {
  //     await TokenService.setToken(oldUser);
  //     return await TokenService.getTokenByUser(oldUser);
  //   } else {
  //     return undefined;
  //   }
  // }
  //
  // async getUserInfo(req: Request): Promise<User> {
  //   return await this.findUser(req);
  // }
  //
  // protected async findUser(req: Request): Promise<User> {
  //   if (req.get(process.env.HEADER_AUTH)) {
  //     const [, token] = req.headers.authorization.split(" ", 2);
  //     return await TokenService.getUserByToken(token);
  //   }
  // }
  //
  async getLatency(): Promise<IPingResult> {
    function update(progress: number, total: number): void {
      console.log(progress, "/", total);
    }
    return await ping(
      {
        address: process.env.PING_ADRESS,
        attempts: Number(process.env.PING_ATTEMPTS),
        port: Number(process.env.PING_PORT),
        timeout: Number(process.env.PING_TIMEOUT),
      },
      update
    ).then((result) => {
      console.log("ping result:", result);
      return result;
    });
  }

  // async userLogout(req: Request): Promise<void> {
  //   const TokenRepo = getConnection(process.env.DB_NAME).getCustomRepository(TokenRepository);
  //   if (req.get(process.env.HEADER_AUTH)) {
  //     const [, token] = req.headers.authorization.split(" ", 2);
  //     await TokenRepo.remove(token);
  //   }
  // }
  //
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
