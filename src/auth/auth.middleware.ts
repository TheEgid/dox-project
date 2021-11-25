import { NestMiddleware, HttpStatus, HttpException, Injectable } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import UserService from "../user/user.service";
import User from "../user/user.entity";

@Injectable()
export default class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authorizationHeader = req.headers.authorization;
    if (authorizationHeader) {
      const header = authorizationHeader.split(" ", 2);
      const [, token] = header;
      const curUser = await this.userService.getUserByToken(token);

      //проверить срок действия!!
      if (curUser instanceof User) {
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
