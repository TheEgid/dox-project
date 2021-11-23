import { IPingResult, ping } from "@network-utils/tcp-ping";
import { Injectable, Logger } from "@nestjs/common";
import { getConnection } from "typeorm";
import User from "../user/user.entity";
import UsersRepository from "../user/user.repository";

@Injectable()
export default class AdminService {
  private readonly DbConnection = () => getConnection(process.env.DB_NAME);

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

  async getUsers(): Promise<User[]> {
    const userRepo = this.DbConnection().getCustomRepository(UsersRepository);
    return await userRepo.findAll();
  }
}
