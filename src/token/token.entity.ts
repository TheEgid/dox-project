import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { v4 as uuid } from "uuid";
import User from "../user/user.entity";

const Id: string = uuid();

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
      this.id = Id;
    }
    if (!this.refreshToken) {
      this.refreshToken = Id;
    }
  }
}
