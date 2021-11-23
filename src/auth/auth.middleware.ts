import { NestMiddleware, HttpStatus, HttpException } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import TokenService from "../token/token.service";
import User from "../user/user.entity";

export class AuthMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const authorizationHeader = req.headers.authorization;
    if (authorizationHeader) {
      const header = authorizationHeader.split(" ", 2);
      const [, token] = header;
      const curUser = await TokenService.getUserByToken(token);
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
