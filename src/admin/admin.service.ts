import { IPingResult, ping } from "@network-utils/tcp-ping";
import { Injectable, Logger } from "@nestjs/common";
import { getCustomRepository } from "typeorm";
import User from "../user/user.entity";
import UsersRepository from "../user/user.repository";

@Injectable()
export default class AdminService {
  async getLatency(): Promise<IPingResult> {
    function update(progress: number, total: number): void {
      Logger.log(`[Ping] ${progress}/${total}`);
    }
    return await ping(
      {
        address: process.env.PING_ADRESS,
        attempts: Number(process.env.PING_ATTEMPTS),
        port: Number(process.env.PING_PORT),
        timeout: Number(process.env.PING_TIMEOUT),
      },
      update
    ).then((result) => result);
  }

  static async getUsers(): Promise<User[]> {
    return await getCustomRepository(UsersRepository).findAll();
  }
}
