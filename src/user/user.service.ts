import { Injectable } from "@nestjs/common";
import { Request } from "express";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as argon2 from "argon2";
import User from "./user.entity";
import Token from "../token/token.entity";
import TokenService from "../token/token.service";
import UserDto from "./user.dto";
import TokenDto from "../token/token.dto";

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
  async userSignup(newUser: UserDto): Promise<TokenDto | undefined> {
    const userRepeat = await this.userRepository.findOne({
      where: { email: newUser.email },
    });
    if (!(userRepeat instanceof UserDto)) {
      newUser.hashedPassword = await argon2.hash(newUser.hashedPassword);
      await this.userRepository.save(newUser);
      await this.tokenService.setToken(newUser);
      return this.tokenService.getTokenByUser(newUser);
    }
    return undefined;
  }

  // Вход
  async userSignin(user: UserDto): Promise<TokenDto | undefined> {
    const oldUser = await this.userRepository.findOne({
      where: { email: user.email },
    });
    if (!(oldUser instanceof UserDto)) {
      return undefined;
    }
    const valid = await argon2.verify(oldUser.hashedPassword, user.hashedPassword);
    if (!valid) {
      return undefined;
    }
    return this.tokenService.updateToken(oldUser);
  }

  async userLogout(req: Request): Promise<void | undefined> {
    if (req.get(process.env.HEADER_AUTH)) {
      const [, token] = req.headers.authorization.split(" ", 2);
      const removedToken = await this.tokenRepository.findOne({
        where: { refreshToken: token },
      });
      if (!(removedToken instanceof TokenDto)) {
        return undefined;
      }
      await this.tokenRepository.remove([removedToken]);
    } else {
      return undefined;
    }
  }

  async getUserInfo(req: Request): Promise<UserDto | undefined> {
    if (req.get(process.env.HEADER_AUTH)) {
      const [, token] = req.headers.authorization.split(" ", 2);
      return this.getUserByToken(token);
    }
    return undefined;
  }

  async getUserByToken(refreshToken: string): Promise<UserDto | undefined> {
    return this.userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("token", "token", "token.userId = user.id")
      .where("token.refreshToken = :1", { 1: refreshToken })
      .getOne();
  }
}
