import { HttpStatus, INestApplication } from "@nestjs/common";
import { getConnection, Repository } from "typeorm";
import { UUIDv4 as uuid } from "uuid-v4-validator";
import request from "supertest";
import argon2 from "argon2";
import { finalizeAfter, IErrorRequest, initializeBefore } from "./fixture.common";
import TokenDto from "../src/token/token.dto";
import User from "../src/user/user.entity";
import UserDto from "../src/user/user.dto";

const isInstanceOfTokenDto = (object: any): object is TokenDto => "refreshToken" in object;
const isInstanceOfUserDto = (object: any): object is UserDto => "hashedPassword" in object;
const isInstanceOfError = (object: any): object is IErrorRequest => "error" in object;

const newAdmin = {
  email: "mocktestadmin@mocktestemail.com",
  hashedPassword: "mocktestadminpassword",
};

let newToken;
const fakeToken = new uuid().id;

describe("Admin [end-to-end]", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initializeBefore();
  });

  // register
  it("set admin POST USER signup", async () => {
    return request(app.getHttpServer())
      .post("/api/auth/signup")
      .send(newAdmin)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(isInstanceOfTokenDto(await response.body)).toBeTruthy();
        const jsonContent = <TokenDto>response.body;
        newToken = jsonContent.refreshToken;
        const repository: Repository<User> = getConnection(process.env.DB_NAME).getRepository(User);
        await repository.query(
          `UPDATE public."user" SET "isAdmin"='true' WHERE "email"='${newAdmin.email}'`
        );
      });
  });

  // enter
  it("positive admin POST USER signin", async () => {
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

  it("positive admin GET Info", async () => {
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

  // wrong token
  it("negative wrong token admin GET Info", async () => {
    return request(app.getHttpServer())
      .get("/api/auth/info")
      .set("Authorization", `Bearer ${fakeToken}`)
      .then(async function (response) {
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(isInstanceOfError(await response.body)).toBeTruthy();
        const errMsg = <IErrorRequest>response.body;
        expect(errMsg.message).toBe("Wrong headers.authorization");
      });
  });

  // no token
  it("negative no token admin GET Info", async () => {
    return request(app.getHttpServer())
      .get("/api/auth/info")
      .then(async function (response) {
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(isInstanceOfError(await response.body)).toBeTruthy();
        const errMsg = <IErrorRequest>response.body;
        expect(errMsg.message).toBe("No headers.authorization");
      });
  });

  afterAll(async () => {
    await finalizeAfter("User");
  });
});
