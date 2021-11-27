import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import User from "../user/user.entity";
import TokenDto from "./token.dto";

@Entity()
export default class Token extends TokenDto {
  @PrimaryGeneratedColumn("uuid")
  readonly id: string;

  @Column()
  accessToken: string;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ type: "timestamp" })
  expiresIn: string;

  @JoinColumn({ name: "userId" })
  @ManyToOne(() => User, (user) => user.token)
  userId: User;
}
