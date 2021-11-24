import { EntityRepository, getConnection, Repository } from "typeorm";
import * as argon2 from "argon2";
import User from "./user.entity";
import IUsersRepository from "./user.repository.interface";

@EntityRepository(User)
class UsersRepository implements IUsersRepository {
  private ormRepository: Repository<User>;

  constructor() {
    this.ormRepository = getConnection(process.env.DB_NAME).getRepository(User);
  }

  public async findByEmailHashedPassword(email: string, hashedPassword: string): Promise<User> {
    const user = await this.findByEmail(email);
    if (!(user instanceof User)) {
      return undefined;
    }
    const valid = await argon2.verify(user.hashedPassword, hashedPassword);
    if (valid === false) {
      return undefined;
    }
    return this.ormRepository.findOne({
      where: { email },
      withDeleted: false,
    });
  }

  public async findAll(): Promise<User[]> {
    return this.ormRepository.find();
  }

  public async findByEmail(email: string): Promise<User | undefined> {
    return this.ormRepository.findOne({
      where: { email },
      withDeleted: false,
    });
  }

  public async save(userData: User): Promise<User> {
    if (userData.hashedPassword.startsWith("$argon2i$v=19$m=4096,t=3,p=1$") === false) {
      userData.hashedPassword = await argon2.hash(userData.hashedPassword);
    }
    return this.ormRepository.save(userData);
  }

  public async create(userData: User): Promise<User> {
    const user = this.ormRepository.create(userData);
    await this.ormRepository.save(user);
    return user;
  }

  public async removeLast(): Promise<void> {
    const user: User = await this.ormRepository.findOne({
      order: { id: "DESC" },
    });
    await this.ormRepository.delete(user.id);
  }
}

export default UsersRepository;

// https://temofeev.ru/info/articles/rukovodstvo-po-autentifikatsii-v-node-js-bez-passport-js-i-storonnikh-servisov/
