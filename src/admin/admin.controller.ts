import { Controller, Get, HttpException, HttpStatus, Injectable, Param } from "@nestjs/common";
import { IPingResult } from "@network-utils/tcp-ping";
import AdminService from "./admin.service";
import UserDto from "../user/user.dto";

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
  async findAll(): Promise<UserDto[]> {
    return this.adminService.findAll();
  }

  @Get("user/:id")
  async findOne(@Param("id") id: string): Promise<UserDto> {
    const user = await this.adminService.findOne(id);
    if (user instanceof UserDto) {
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
