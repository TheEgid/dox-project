import { HttpStatus, INestApplication } from "@nestjs/common";
import { getConnection, Repository } from "typeorm";
import argon2 from "argon2";
import { UUIDv4 as uuid } from "uuid-v4-validator";
import request from "supertest";
import { finalizeAfter, initializeBefore, IErrorRequest } from "./fixture.common";
import TokenDto from "../src/token/token.dto";
import User from "../src/user/user.entity";
import UserDto from "../src/user/user.dto";

const isInstanceOfTokenDto = (object: any): object is TokenDto => "refreshToken" in object;
const isInstanceOfUserDto = (object: any): object is UserDto => "hashedPassword" in object;
const isInstanceOfError = (object: any): object is IErrorRequest => "error" in object;

const newUser = {
  email: "mocktestusert@mocktestemail.com",
  hashedPassword: "mocktestpassword",
};

let newToken;
const fakeToken = new uuid().id;

describe("User [end-to-end]", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initializeBefore();
  });

  // register
  it("+ POST USER signup", async () => {
    return request(app.getHttpServer())
      .post("/api/auth/signup")
      .send(newUser)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(isInstanceOfTokenDto(await response.body)).toBeTruthy();
        const jsonContent = <TokenDto>response.body;
        newToken = jsonContent.refreshToken;
      });
  });

  // enter
  it("+ POST USER signin", async () => {
    return request(app.getHttpServer())
      .post("/api/auth/signin")
      .send(newUser)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(isInstanceOfTokenDto(await response.body)).toBeTruthy();
        const jsonContent = <TokenDto>response.body;
        expect(newToken).toBe(jsonContent.refreshToken);
      });
  });

  // register already been
  it("- POST USER signup", async () => {
    const repository: Repository<User> = getConnection(process.env.DB_NAME).getRepository(User);
    const userRepeat = await repository.findOne({
      where: { email: newUser.email },
    });
    return request(app.getHttpServer())
      .post("/api/auth/signup")
      .send(newUser)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.NOT_ACCEPTABLE);
        expect(isInstanceOfError(await response.body)).toBeTruthy();
        const errMsg = <IErrorRequest>response.body;
        expect(errMsg.message).toBe(`Already signup as ${userRepeat.email}`);
      });
  });

  it("+ GET USER Info", async () => {
    return request(app.getHttpServer())
      .get("/api/auth/info")
      .set("Authorization", `Bearer ${newToken as string}`)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        expect(isInstanceOfUserDto(await response.body)).toBeTruthy();
        const infoUser = <UserDto>response.body;
        const valid = await argon2.verify(infoUser.hashedPassword, newUser.hashedPassword);
        expect(valid).toBeTruthy();
        expect(infoUser.isAdmin).toBeFalsy();
      });
  });

  // wrong token
  it("- GET USER Info (wrong token)", async () => {
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
  it("- GET USER Info (no token)", async () => {
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
