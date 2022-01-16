import { NestMiddleware, HttpStatus, HttpException, Injectable } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import UserService from "../user/user.service";
import User from "../user/user.entity";

@Injectable()
export default class AdminMiddleware implements NestMiddleware {
    constructor(private readonly userService: UserService) {}

    async use(req: Request, res: Response, next: NextFunction) {
        const authorizationHeader = req.headers.authorization;
        if (authorizationHeader) {
            const header = authorizationHeader.split(" ", 2);
            const [, token] = header;
            const curUser = await this.userService.getUserByToken(token);
            if (curUser instanceof User && curUser.isAdmin === true) {
                next();
            } else {
                throw new HttpException(
                    {
                        statusCode: HttpStatus.FORBIDDEN,
                        message: "Only admin authorization",
                        error: "FORBIDDEN",
                    },
                    HttpStatus.FORBIDDEN
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
