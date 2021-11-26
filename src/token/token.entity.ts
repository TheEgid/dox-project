import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { UUIDv4 as uuid } from "uuid-v4-validator";
import User from "../user/user.entity";

@Entity()
export default class Token {
  @PrimaryGeneratedColumn("uuid")
  readonly id: string;

  @Column()
  accessToken: string;

  @Column()
  refreshToken: string;

  @Column({ type: "timestamp" })
  expiresIn: string;

  @JoinColumn({ name: "userId" })
  @ManyToOne(() => User, (user) => user.token)
  userId: User;

  constructor() {
    if (!this.id) {
      this.id = String(new uuid());
    }
    if (!this.refreshToken) {
      this.refreshToken = new uuid().id;
    }
  }
}
