import { HttpStatus, INestApplication } from "@nestjs/common";
import { getConnection, Repository } from "typeorm";
import { UUIDv4 as uuid } from "uuid-v4-validator";
import request from "supertest";
import path from "path";
import fs from "fs";
import argon2 from "argon2";
import { finalizeAfter, initializeBefore, IErrorRequest } from "./fixture.common";
import TokenDto from "../src/token/token.dto";
import User from "../src/user/user.entity";
import UserDto from "../src/user/user.dto";
import Token from "../src/token/token.entity";
import TokenService from "../src/token/token.service";
import Document from "../src/document/document.entity";

interface ISuccess {
  docxPath: string;
  fileContent: string;
}

const isInstanceOfTokenDto = (object: any): object is TokenDto => "refreshToken" in object;
const isInstanceOfUserDto = (object: any): object is UserDto => "hashedPassword" in object;
const isInstanceOfSuccess = (object: any): object is ISuccess => "fileContent" in object;
const isInstanceOfError = (object: any): object is IErrorRequest => "error" in object;

const newUser = {
  email: "mocktestusert@mocktestemail.com",
  hashedPassword: "mocktestpassword",
};

let newToken: string;
const fakeToken = new uuid().id;
const dayAgo = new Date(new Date().getTime() - 86400000).toISOString(); // - day in ms;

describe("User [end-to-end]", () => {
  let app: INestApplication;
  let tokenRepo: Repository<Token>;
  let userRepo: Repository<User>;
  let documentRepo: Repository<Document>;

  beforeAll(async () => {
    app = await initializeBefore();
    tokenRepo = getConnection(process.env.DB_NAME).getRepository(Token);
    userRepo = getConnection(process.env.DB_NAME).getRepository(User);
    documentRepo = getConnection(process.env.DB_NAME).getRepository(Document);
  });

  // register
  it("+ POST USER signup (register)", async () => {
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

  it("+ POST USER signin (entry)", async () => {
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

  it("- POST USER signup (already registered)", async () => {
    const userRepeat = await userRepo.findOne({
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

  it("+ POST USER upload (authorized)", async () => {
    const filePath = path.join(__dirname, "testFiles", "test upload.pdf");

    if (!fs.existsSync(filePath)) throw Error(`${filePath} not exists!`);

    return request(app.getHttpServer())
      .post("/api/upload/upload")
      .set("Authorization", `Bearer ${newToken}`)
      .attach("customfile", filePath)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(isInstanceOfSuccess(await response.body)).toBeTruthy();

        const jsonContent = <ISuccess>response.body;

        expect(jsonContent.docxPath.endsWith("docx")).toBeTruthy();
        expect(jsonContent.fileContent.length !== 0).toBeTruthy();
        expect(fs.existsSync(jsonContent.docxPath)).toBeTruthy();
        expect(jsonContent.docxPath.indexOf("86e625c6") > 0).toBeTruthy();

        const createdDocument = await documentRepo.findOne({
          order: { createdAt: "DESC" },
        });

        expect(createdDocument.userHiddenName).toEqual("mo***********@m************.***");
        expect(createdDocument.filename).toEqual("86e625c6.docx");
        expect(createdDocument.content.indexOf("АРБИТРАЖНЫЙ СУД") > 0).toBeTruthy();
      });
  });

  it("- POST USER upload (authorized)", async () => {
    const filePath = path.join(__dirname, "testFiles", "test upload.pdf");

    if (!fs.existsSync(filePath)) throw Error(`${filePath} not exists!`);

    return request(app.getHttpServer())
      .post("/api/upload/upload")
      .set("Authorization", `Bearer ${fakeToken}`)
      .attach("customfile", filePath)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(isInstanceOfSuccess(await response.body)).toBeTruthy();

        const jsonContent = <ISuccess>response.body;

        expect(jsonContent.docxPath.endsWith("docx")).toBeTruthy();
        expect(jsonContent.fileContent.length !== 0).toBeTruthy();
        expect(fs.existsSync(jsonContent.docxPath)).toBeTruthy();
        expect(jsonContent.docxPath.indexOf("86e625c6") > 0).toBeTruthy();

        const createdDocument = await documentRepo.findOne({
          order: { createdAt: "DESC" },
        });

        expect(createdDocument.userHiddenName).toEqual("anonymous");
        expect(createdDocument.filename).toEqual("86e625c6.docx");
        expect(createdDocument.content.indexOf("АРБИТРАЖНЫЙ СУД") > 0).toBeTruthy();
      });
  });

  it("+ GET USER Info", async () => {
    return request(app.getHttpServer())
      .get("/api/auth/info")
      .set("Authorization", `Bearer ${newToken}`)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        expect(isInstanceOfUserDto(await response.body)).toBeTruthy();
        const infoUser = <UserDto>response.body;
        const valid = await argon2.verify(infoUser.hashedPassword, newUser.hashedPassword);
        expect(valid).toBeTruthy();
        expect(infoUser.isAdmin).toBeFalsy();
      });
  });

  it("- GET USER Info (invalid token)", async () => {
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

  it("+ GET USER Info (update token)", async () => {
    const tokenService = new TokenService(tokenRepo);

    const currentToken = await tokenRepo.findOne({
      where: { refreshToken: newToken },
    });
    await tokenRepo.query(
      `UPDATE public."token" SET "expiresIn"='${dayAgo}' WHERE "id"='${currentToken.id}'`
    );
    const expiredToken = await tokenRepo.findOne({
      where: { id: currentToken.id },
    });

    return request(app.getHttpServer())
      .get("/api/auth/info")
      .set("Authorization", `Bearer ${expiredToken.refreshToken}`)
      .then(async function (response) {
        expect(response.status).toBe(HttpStatus.OK);
        expect(isInstanceOfUserDto(await response.body)).toBeTruthy();
        const actualToken = await tokenService.getTokenByUser(<User>response.body);
        expect(actualToken.id).not.toEqual(expiredToken.id);
        expect(actualToken.accessToken).toEqual(expiredToken.accessToken);
        expect(actualToken.refreshToken).not.toEqual(expiredToken.refreshToken);
        expect(actualToken.expiresIn > expiredToken.expiresIn).toBeTruthy();
      });
  });

  it("+ GET USER logout (exit)", async () => {
    const delToken = await tokenRepo.findOne({ where: { refreshToken: newToken } });
    return request(app.getHttpServer())
      .get("/api/auth/logout")
      .set("Authorization", `Bearer ${newToken}`)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        expect(isInstanceOfTokenDto(await response.body)).toBeTruthy();
        const jsonContent = <TokenDto>response.body;
        const zeroToken = jsonContent.refreshToken;
        expect(zeroToken).toBeNull();
        const expToken = await tokenRepo.findOne({ where: { id: delToken.id } });
        expect(expToken.refreshToken).toBeNull();
        expect(expToken.id).toEqual(jsonContent.id);
      });
  });

  it("- GET USER logout (repeated)", async () => {
    return request(app.getHttpServer())
      .get("/api/auth/logout")
      .set("Authorization", `Bearer ${newToken}`)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(isInstanceOfError(await response.body)).toBeTruthy();
        const errMsg = <IErrorRequest>response.body;
        expect(errMsg.message).toBe("Wrong headers.authorization");
      });
  });

  it("- GET USER Info (already logout)", async () => {
    return request(app.getHttpServer())
      .get("/api/auth/info")
      .set("Authorization", `Bearer ${newToken}`)
      .then(async function (response) {
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(isInstanceOfError(await response.body)).toBeTruthy();
        const errMsg = <IErrorRequest>response.body;
        expect(errMsg.message).toBe("Wrong headers.authorization");
      });
  });

  afterAll(async () => {
    await finalizeAfter("User");
  });
});