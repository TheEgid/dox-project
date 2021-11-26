import { Controller, Get, HttpException, HttpStatus, Injectable, Param } from "@nestjs/common";
import { IPingResult } from "@network-utils/tcp-ping";
import AdminService from "./admin.service";
import User from "../user/user.entity";

@Injectable()
@Controller("api/admin")
export default class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // // Время задержки сервера
  @Get("latency")
  async getPing(): Promise<IPingResult> {
    return this.adminService.getLatency();
  }

  @Get("users")
  async findAll(): Promise<User[]> {
    return this.adminService.findAll();
  }

  @Get("user/:id")
  async findOne(@Param("id") id: string): Promise<User> {
    const user = await this.adminService.findOne(id);
    if (user instanceof User) {
      return user;
    }
    throw new HttpException(
      {
        statusCode: HttpStatus.NOT_ACCEPTABLE,
        message: `Wrong Id: ${id}`,
        error: "NOT_ACCEPTABLE",
      },
      HttpStatus.NOT_ACCEPTABLE
    );
  }
}
