import User from "../user/user.entity";

export class TokenDTO {
  readonly accessToken: string;

  readonly refreshToken: string;

  readonly expiresIn: string;

  readonly userId: User;
}

export class CreateTokenDto {
  readonly accessToken: string;

  readonly refreshToken: string;

  readonly expiresIn: string;

  readonly userId: User;
}

export class UpdateTokenDto {
  id: string;

  readonly accessToken: string;

  readonly refreshToken: string;

  readonly expiresIn: string;

  readonly userId: User;
}
