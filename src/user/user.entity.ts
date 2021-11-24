import { IsEmail, MinLength } from "class-validator";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from "typeorm";
import { v4 as uuid } from "uuid";
import Token from "../token/token.entity";

const Id: string = uuid();

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
  @MinLength(2)
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
      this.id = Id;
    }
  }
}
