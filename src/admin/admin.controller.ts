import { Controller, Get, Injectable, Param } from "@nestjs/common";
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
  async findOne(@Param("id") id: string) {
    return this.adminService.findOne(id);
  }
}
