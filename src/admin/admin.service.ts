import { IPingResult, ping } from "@network-utils/tcp-ping";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import User from "../user/user.entity";

@Injectable()
export default class AdminService {
  // private readonly DbConnection = () => getConnection(process.env.DB_NAME);
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
    // const userRepo = this.DbConnection().getCustomRepository(UsersRepository);
    return this.userRepository.find();
  }

  async findOne(id: string) {
    return this.userRepository.findOne(id);
  }
}
