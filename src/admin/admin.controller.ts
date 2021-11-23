import { Controller, Get, Injectable } from "@nestjs/common";
import { IPingResult } from "@network-utils/tcp-ping";
import AdminService from "./admin.service";
import User from "../user/user.entity";

@Injectable()
@Controller()
export default class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // // Время задержки сервера
  @Get("/api/latency")
  async getPing(): Promise<IPingResult> {
    return await this.adminService.getLatency();
  }

  @Get("/api/users")
  async getUsers(): Promise<User[]> {
    return await this.adminService.getUsers();
  }
}
