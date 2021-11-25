import { NestMiddleware, HttpStatus, HttpException, Injectable } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import UserService from "../user/user.service";
import TokenService from "../token/token.service";
import Token from "../token/token.entity";

@Injectable()
export default class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authorizationHeader = req.headers.authorization;
    if (authorizationHeader) {
      const header = authorizationHeader.split(" ", 2);
      const [, inputToken] = header;
      const curUser = await this.userService.getUserByToken(inputToken);
      //проверить срок действия!!
      const updatedToken = await this.tokenService.updateToken(curUser);
      if (updatedToken instanceof Token) {
        next();
      } else {
        throw new HttpException(
          {
            statusCode: HttpStatus.UNAUTHORIZED,
            message: "Wrong headers.authorization",
            error: "UNAUTHORIZED",
          },
          HttpStatus.UNAUTHORIZED
        );
      }
    } else {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: "No headers.authorization",
          error: "UNAUTHORIZED",
        },
        HttpStatus.UNAUTHORIZED
      );
    }
  }
}
