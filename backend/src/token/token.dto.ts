import User from "../user/user.entity";
import { UUIDv4 as uuid } from "uuid-v4-validator";

export default class TokenDto {
    readonly id: string;

    readonly accessToken: string;

    readonly refreshToken: string;

    readonly expiresIn: string;

    readonly userId: User;

    constructor() {
        if (!this.refreshToken) {
            this.refreshToken = new uuid().id;
        }
    }
}
