import { HttpStatus, INestApplication } from "@nestjs/common";
import { getConnection, Repository } from "typeorm";
import request from "supertest";
import argon2 from "argon2";
import { finalizeAfter, IerrorRequest, initializeBefore } from "./fixture.common";
import TokenDto from "../src/token/token.dto";
import User from "../src/user/user.entity";
import UserDto from "../src/user/user.dto";

const isInstanceOfTokenDto = (object: any): object is TokenDto => "refreshToken" in object;
const isInstanceOfUserDto = (object: any): object is UserDto => "hashedPassword" in object;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isInstanceOfError = (object: any): object is IerrorRequest => "error" in object;

const newAdmin = {
  email: "mocktestadmin@mocktestemail.com",
  hashedPassword: "mocktestpassword",
};

let newToken;

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

  // {
  //   id: 'ddc8c155-5b6b-4433-900b-0eeb8829d3d9',
  //     email: 'mocktestadmin@mocktestemail.com',
  //   hashedPassword: 'MotI4566hqfsRy+E',
  //   createdAt: '2021-12-01T08:37:22.363Z',
  //   isActive: true,
  //   isAdmin: true
  // }

  // // register already been
  // it("negative POST USER signup", async () => {
  //   const repository: Repository<User> = getConnection(process.env.DB_NAME).getRepository(User);
  //   const userRepeat = await repository.findOne({
  //     where: { email: newUser.email },
  //   });
  //   return request(app.getHttpServer())
  //     .post("/api/auth/signup")
  //     .send(newUser)
  //     .then(async (response) => {
  //       expect(response.status).toBe(HttpStatus.NOT_ACCEPTABLE);
  //       expect(isInstanceOfError(await response.body)).toBeTruthy();
  //       const errMsg = <IerrorRequest>response.body;
  //       expect(errMsg.message).toBe(`Already signup as ${userRepeat.email}`);
  //     });
  // });

  afterAll(async () => {
    await finalizeAfter("User");
  });
});
