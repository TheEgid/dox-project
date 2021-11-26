import { IsEmail, MinLength } from "class-validator";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from "typeorm";
import { UUIDv4 as uuid } from "uuid-v4-validator";
import Token from "../token/token.entity";

@Entity()
export default class User {
  @PrimaryGeneratedColumn("uuid")
  readonly id: string;

  @IsEmail()
  @Column({
    length: 160,
    unique: true,
  })
  email: string;

  @Column("text")
  @MinLength(6)
  hashedPassword: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isAdmin: boolean;

  @OneToMany(() => Token, (token) => token.userId)
  token: Token;

  constructor() {
    if (!this.id) {
      this.id = new uuid().id;
    }
  }
}
