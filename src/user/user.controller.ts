import {
  Body,
  Get,
  Post,
  Req,
  Controller,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { Request } from "express";
import UserService from "./user.service";
import TokenDto from "../token/token.dto";
import UserDto from "./user.dto";

@Injectable()
@Controller("auth")
export default class UserController {
  constructor(private readonly userService: UserService) {}

  // Регистрация пользователя
  @Post("signup")
  async userSignup(@Body() user: UserDto): Promise<TokenDto> {
    const newToken = await this.userService.userSignup(user);
    if (newToken instanceof TokenDto) {
      return newToken;
    }
    throw new HttpException(
      {
        statusCode: HttpStatus.NOT_ACCEPTABLE,
        message: `Already signup as ${user.email}`,
        error: "NOT_ACCEPTABLE",
      },
      HttpStatus.NOT_ACCEPTABLE
    );
  }

  @Post("signin")
  async userSignin(@Body() user: UserDto): Promise<TokenDto> {
    const oldtoken = await this.userService.userSignin(user);
    if (oldtoken instanceof TokenDto) {
      return oldtoken;
    }
    throw new HttpException(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: "Wrong Password or Username",
        error: "UNAUTHORIZED",
      },
      HttpStatus.UNAUTHORIZED
    );
  }

  @Get("info")
  async getUserInfo(@Req() req: Request): Promise<UserDto | undefined> {
    const infoUser = await this.userService.getUserInfo(req);
    if (infoUser instanceof UserDto) {
      return infoUser;
    }
    throw new HttpException(
      {
        statusCode: HttpStatus.NO_CONTENT,
        message: "Error user info",
        error: "NO_CONTENT",
      },
      HttpStatus.NO_CONTENT
    );
  }

  @Get("logout")
  async userLogout(@Req() req: Request): Promise<void> {
    await this.userService.userLogout(req);
  }
}
