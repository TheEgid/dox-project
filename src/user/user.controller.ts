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
import User from "./user.entity";
import Token from "../token/token.entity";

@Injectable()
@Controller("api/auth")
export default class UserController {
  constructor(private readonly userService: UserService) {}

  // Регистрация пользователя
  @Post("signup")
  async userSignup(@Body() user: User): Promise<Token> {
    const newToken = await this.userService.userSignup(user);
    if (newToken instanceof Token) {
      return newToken;
    }
    throw new HttpException(
      {
        statusCode: HttpStatus.NOT_ACCEPTABLE,
        message: `Already logged as ${user.email}`,
        error: "NOT_ACCEPTABLE",
      },
      HttpStatus.NOT_ACCEPTABLE
    );
  }

  @Post("signin")
  async userSignin(@Body() user: User): Promise<Token> {
    const oldtoken = await this.userService.userSignin(user);
    if (oldtoken instanceof Token) {
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
  async getUserInfo(@Req() req: Request): Promise<User> {
    const infoUser = await this.userService.getUserInfo(req);
    if (infoUser instanceof User) {
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

// // ????
// @Delete("/delete-last-user/:key")
// @OnUndefined(StatusCodes.OK)
// public async deleteLastUser(@Param("key") key: string): Promise<void> {
//   if (key === process.env.ACCESS_DELETE_KEY) {
//     return await this.userService.deleteLastUser();
//   }
// }

// @Controller()
// export default class UserController {
//   @Get("/user/:id")
//   @OnUndefined(StatusCodes.BAD_REQUEST)
//   @UseBefore(loggingBefore)
//   @UseAfter(loggingAfter)
//   public async getUserById(@Param("id") id: string) {
//     return await getConnection(process.env.DB_NAME)
//       .getCustomRepository(UsersRepository)
//       .findById(id);
//   }
//

//   connection()
// DatabaseConnectionFacade.multipleConnections().then(() =>
//   getRepository(User).find({ where: { id: id } })
// );
// return getConnection()
// return `This action returns user #${id}`;

// @Post("/users/:id")
// @OnUndefined(204)
// postOne(@Param("id") id: number, @Body() info: Info) {
//   console.log(JSON.stringify(info));
//   console.log(`tracedId = ${httpContext.get("traceId") as string}`);
// }
// }

/**
 * Envoie un email
 * @param subject l'objet du mail
 * @param text le corps du mail
 * @param to la liste des destinatire (email séparés par des )
 * @param from l'adresse utilisé pour envoyer le mail
 */

// export function sendEmail(subject: string, text: string, to, from = "system@absolumentg.fr") {
//   const transport = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: process.env.SMTP_PORT,
//     secure: true,
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS
//     }
//   });
//
//   const email = {
//     from,
//     to,
//     subject,
//     text
//   };
//   transport.sendMail(email, function(err, info) {
//     if (err) {
//       logger.error("Erreur lors de l'envoie d'email", err);
//     } else {
//       logger.info("Email envoyé", info);
//     }
//   });
// }
