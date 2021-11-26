import { IPingResult, ping } from "@network-utils/tcp-ping";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import User from "../user/user.entity";
import { UUIDv4 } from "uuid-v4-validator";

@Injectable()
export default class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async getLatency(): Promise<IPingResult> {
    function update(progress: number, total: number): void {
      Logger.log(`[Ping] ${progress}/${total}`);
    }
    return ping(
      {
        address: process.env.PING_ADRESS,
        attempts: Number(process.env.PING_ATTEMPTS),
        port: Number(process.env.PING_PORT),
        timeout: Number(process.env.PING_TIMEOUT),
      },
      update
    ).then((result) => result);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string) {
    if (!UUIDv4.validate(id)) {
      return undefined;
    }
    return this.userRepository.findOne(id);
  }
}
