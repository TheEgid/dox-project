import Token from "../token/token.entity";

export default class UserDto {
  readonly id: string;

  readonly email: string;

  hashedPassword: string;

  readonly createdAt: Date;

  readonly isActive: boolean;

  readonly isAdmin: boolean;

  readonly token: Token;
}
