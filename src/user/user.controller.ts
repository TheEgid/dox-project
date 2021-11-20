import { Body, Get, Post, Req, Param, Delete, Controller } from "@nestjs/common";
import UserService from "./user.service";
// import { Request } from "express";
// import { StatusCodes } from "http-status-codes";
// import { IPingResult } from "@network-utils/tcp-ping";

import { IPingResult } from "@network-utils/tcp-ping";
import User from "./user.entity";
import Token from "../token/token.entity";
// import ControllerError from "./ControllerError";

@Controller()
export default class UserController {
  userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // Регистрация пользователя
  @Post("/api/signup")
  async registrateUser(@Body() user: User): Promise<Token> {
    const newtoken = await this.userService.userSignup(user);
    console.log(newtoken);
    if (newtoken instanceof Token) {
      return newtoken;
    } else {
      throw new Error(); //ControllerError(StatusCodes.NOT_ACCEPTABLE, `Already logged as ${user.email}`);
    }
  }

  // @Post("/signin")
  // async login(@Body() user: User): Promise<Token> {
  //   const oldtoken = await this.userService.userSignin(user);
  //   if (oldtoken instanceof Token) {
  //     return oldtoken;
  // } else {
  //   throw new ControllerError(StatusCodes.NOT_FOUND, "Wrong Password or Username");
  // }
  // }

  // // Возвращает авторизированного пользователя
  // @Authorized()
  // @OnUndefined(StatusCodes.BAD_REQUEST)
  // @Get("/info")
  // async getId(@Req() req: Request): Promise<User> {
  //   return await this.userService.getUserInfo(req);
  // }

  // // Время задержки сервера
  // @Authorized()
  // @OnUndefined(StatusCodes.BAD_REQUEST)
  @Get("/api/latency")
  async getPing(): Promise<IPingResult> {
    return await this.userService.getLatency();
  }
}

//
// @Authorized()
// @Get("/logout")
// async logout(@Req() req: Request): Promise<void> {
//   return await this.userService.userLogout(req);
// }
//
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

// @Get("/")
// // Протестировано добавление заголовков
// @Header("Access-Control-Allow-Origin", "*")
// @Header(
//   "Access-Control-Allow-Headers",
//   "Origin, X-Requested-With, Content-Type, Accept, X-Access-Token"
// )
// getStart() {
//   return { message: "Server is running" };
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
