import { NestMiddleware, HttpStatus, HttpException, Injectable } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import TokenService from "../token/token.service";
import User from "../user/user.entity";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly tokenService: TokenService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authorizationHeader = req.headers.authorization;
    if (authorizationHeader) {
      const header = authorizationHeader.split(" ", 2);
      const [, token] = header;
      const curUser = await this.tokenService.getUserByToken(token);
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

// @Injectable()
// export class RoleMiddleware implements NestMiddleware {
//   use(req: Request, res: Response, next: NextFunction) {
//     if (req.jwtUser.role === ERole.VISITOR) {
//       return res.status(HttpStatus.FORBIDDEN).json({error: 'The resource is forbidden for visitors.'})
//     }
//     return next()
//
//   }

// https://github.com/DmitryKirilenko16/manager-api-demo/blob/91c897b0dfeb78ce86deae44eccacfff44aa3f93/src/app/auth/middlewares/role.middleware.ts

// @Injectable()
// export class AdminMiddleware implements NestMiddleware {
//   use(req: Request, res: Response, next: () => void) {
//     try {
//       const token = req.headers.authorization.split(' ');
//       const decoded: any = jwt.verify(token[1], KEY);
//       req.body.userId = decoded.id;
//       if (decoded.role == 'admin') return next();
//       throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED);
//     } catch (e) {
//       throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED);
//     }
//   }
// }
