import { IsEmail, MinLength } from "class-validator";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from "typeorm";
import Token from "../token/token.entity";
import UserDto from "./user.dto";

@Entity()
export default class User extends UserDto {
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
}
