import { HttpStatus, INestApplication } from "@nestjs/common";
import { getConnection, Repository } from "typeorm";
import request from "supertest";
import argon2 from "argon2";
import { finalizeAfter, initializeBefore } from "./fixture.common";
import TokenDto from "../src/token/token.dto";
import User from "../src/user/user.entity";
import UserDto from "../src/user/user.dto";

const isInstanceOfUserDto = (object: any): object is UserDto => "hashedPassword" in object;
const isInstanceOfTokenDto = (object: any): object is TokenDto => "refreshToken" in object;

const newAdmin = {
    email: "mocktestadmin@mocktestemail.com",
    hashedPassword: "mocktestadminpassword",
};

let newToken;

describe("Admin [end-to-end]", () => {
    let app: INestApplication;

    beforeAll(async () => {
        app = await initializeBefore();
    });

    // register
    it("+ POST ADMIN signup", async () => {
        return request(app.getHttpServer())
            .post("/api/auth/signup")
            .send(newAdmin)
            .then(async (response) => {
                expect(response.status).toBe(HttpStatus.CREATED);
                expect(isInstanceOfTokenDto(await response.body)).toBeTruthy();
                const jsonContent = <TokenDto>response.body;
                newToken = jsonContent.refreshToken;
                const repository: Repository<User> = getConnection(
                    process.env.DB_NAME
                ).getRepository(User);
                await repository.query(
                    `UPDATE public."user" SET "isAdmin"='true' WHERE "email"='${newAdmin.email}'`
                );
            });
    });

    // enter
    it("+ POST ADMIN signin", async () => {
        return request(app.getHttpServer())
            .post("/api/auth/signin")
            .send(newAdmin)
            .then(async (response) => {
                expect(response.status).toBe(HttpStatus.CREATED);
                expect(isInstanceOfTokenDto(await response.body)).toBeTruthy();
                const bodyContent = <TokenDto>response.body;
                expect(newToken).toBe(bodyContent.refreshToken);
            });
    });

    it("+ GET ADMIN Info", async () => {
        return request(app.getHttpServer())
            .get("/api/auth/info")
            .set("Authorization", `Bearer ${newToken as string}`)
            .then(async (response) => {
                expect(response.status).toBe(HttpStatus.OK);
                expect(isInstanceOfUserDto(await response.body)).toBeTruthy();
                const infoUser = <UserDto>response.body;
                const valid = await argon2.verify(infoUser.hashedPassword, newAdmin.hashedPassword);
                expect(valid).toBeTruthy();
                expect(infoUser.isAdmin).toBeTruthy();
            });
    });
    afterAll(async () => {
        await finalizeAfter("User");
    });
});
