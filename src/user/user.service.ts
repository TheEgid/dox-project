import { Injectable } from "@nestjs/common";
import { Request } from "express";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as argon2 from "argon2";
import User from "./user.entity";
import Token from "../token/token.entity";
import TokenService from "../token/token.service";

@Injectable()
export default class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
    private readonly tokenService: TokenService
  ) {}

  // Регистрация
  async userSignup(newUser: User): Promise<Token> {
    const userRepeat = await this.userRepository.findOne({
      where: { email: newUser.email },
    });
    if (!(userRepeat instanceof User)) {
      newUser.hashedPassword = await argon2.hash(newUser.hashedPassword);
      await this.userRepository.save(newUser);
      await this.tokenService.setToken(newUser);
      return this.tokenService.getTokenByUser(newUser);
    }
    return undefined;
  }

  // Вход
  async userSignin(user: User): Promise<Token> {
    const oldUser = await this.userRepository.findOne({
      where: { email: user.email },
    });
    if (!(oldUser instanceof User)) {
      return undefined;
    }
    const valid = await argon2.verify(oldUser.hashedPassword, user.hashedPassword);
    if (!valid) {
      return undefined;
    }
    return this.tokenService.updateToken(oldUser);
  }

  async userLogout(req: Request): Promise<void> {
    if (req.get(process.env.HEADER_AUTH)) {
      const [, token] = req.headers.authorization.split(" ", 2);
      const removedToken = await this.tokenRepository.findOne({
        where: { refreshToken: token },
      });
      if (!(removedToken instanceof Token)) {
        return undefined;
      }
      await this.tokenRepository.remove([removedToken]);
    } else {
      return undefined;
    }
  }

  async getUserInfo(req: Request): Promise<User> {
    if (req.get(process.env.HEADER_AUTH)) {
      const [, token] = req.headers.authorization.split(" ", 2);
      return this.getUserByToken(token);
    }
    return null;
  }

  async getUserByToken(refreshToken: string): Promise<User> {
    return this.userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("token", "token", "token.userId = user.id")
      .where("token.refreshToken = :1", { 1: refreshToken })
      .getOne();
  }
}

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
