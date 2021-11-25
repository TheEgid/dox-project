import User from "../user/user.entity";

export class TokenDTO {
  accessToken: string;

  refreshToken: string;

  expiresIn: string;

  userId: User;
}

// export class CreateTokenDto {
//   accessToken: string;
//
//   refreshToken: string;
//
//   expiresIn: string;
//
//   userId: User;
// }

export class UpdateTokenDto {
  id: string;

  accessToken: string;

  refreshToken: string;

  expiresIn: string;

  userId: User;
}
