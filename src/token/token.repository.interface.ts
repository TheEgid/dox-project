import User from "../user/user.entity";
import Token from "./token.entity";

export default interface ITokenRepository {
  generate(user: User): Promise<void>;
  findByToken(token: string): Promise<Token | undefined>;
}
