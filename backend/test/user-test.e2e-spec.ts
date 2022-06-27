import { HttpStatus, INestApplication } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
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
    let appDataSource: DataSource;
    let tokenRepo: Repository<Token>;
    let userRepo: Repository<User>;
    let documentRepo: Repository<Document>;

    beforeAll(async () => {
        app = await initializeBefore();
        await app.init();
        appDataSource = app.get(DataSource);
        tokenRepo = appDataSource.getRepository(Token);
        userRepo = appDataSource.getRepository(User);
        documentRepo = appDataSource.getRepository(Document);
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
                const createdDocument = await documentRepo.find({
                    order: { createdAt: "DESC" },
                    take: 1,
                });
                expect(createdDocument[0].userHiddenName).toEqual(
                    "mo***********@m************.***"
                );
                expect(createdDocument[0].filename).toEqual("86e625c6.docx");
                expect(createdDocument[0].content.indexOf("АРБИТРАЖНЫЙ СУД") > 0).toBeTruthy();
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
                // console.log(response.status);
                expect(response.status).toBe(HttpStatus.CREATED);
                expect(isInstanceOfSuccess(await response.body)).toBeTruthy();

                const jsonContent = <ISuccess>response.body;

                expect(jsonContent.docxPath.endsWith("docx")).toBeTruthy();
                expect(jsonContent.fileContent.length !== 0).toBeTruthy();
                expect(fs.existsSync(jsonContent.docxPath)).toBeTruthy();
                expect(jsonContent.docxPath.indexOf("86e625c6") > 0).toBeTruthy();
                const createdDocument = await documentRepo.find({
                    order: { createdAt: "DESC" },
                    take: 1,
                });
                expect(createdDocument[0].userHiddenName).toEqual("anonymous");
                expect(createdDocument[0].filename).toEqual("86e625c6.docx");
                expect(createdDocument[0].content.indexOf("АРБИТРАЖНЫЙ СУД") > 0).toBeTruthy();
            });
    });

    it("+ GET USER Info", async () => {
        return (
            request(app.getHttpServer())
                // eslint-disable-next-line sonarjs/no-duplicate-string
                .get("/api/auth/info")
                .set("Authorization", `Bearer ${newToken}`)
                .then(async (response) => {
                    expect(response.status).toBe(HttpStatus.OK);
                    expect(isInstanceOfUserDto(await response.body)).toBeTruthy();
                    const infoUser = <UserDto>response.body;
                    const valid = await argon2.verify(
                        infoUser.hashedPassword,
                        newUser.hashedPassword
                    );
                    expect(valid).toBeTruthy();
                    expect(infoUser.isAdmin).toBeFalsy();
                })
        );
    });

    it("- GET USER Info (invalid token)", async () => {
        return request(app.getHttpServer())
            .get("/api/auth/info")
            .set("Authorization", `Bearer ${fakeToken}`)
            .then(async function (response) {
                expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
                expect(isInstanceOfError(await response.body)).toBeTruthy();
                const errMsg = <IErrorRequest>response.body;
                // eslint-disable-next-line sonarjs/no-duplicate-string
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
        const currentToken = await tokenRepo.findBy({ refreshToken: newToken });
        await tokenRepo.query(
            `UPDATE public."token" SET "expiresIn"='${dayAgo}' WHERE "id"='${currentToken[0].id}'`
        );
        const expiredToken = await tokenRepo.findBy({ refreshToken: newToken });

        return request(app.getHttpServer())
            .get("/api/auth/info")
            .set("Authorization", `Bearer ${expiredToken[0].refreshToken}`)
            .then(async function (response) {
                expect(response.status).toBe(HttpStatus.OK);
                expect(isInstanceOfUserDto(await response.body)).toBeTruthy();
                const actualToken = await tokenService.getTokenByUser(<User>response.body);
                expect(actualToken.id).not.toEqual(expiredToken[0].id);
                expect(actualToken.accessToken).toEqual(expiredToken[0].accessToken);
                expect(actualToken.refreshToken).not.toEqual(expiredToken[0].refreshToken);
                expect(actualToken.expiresIn > expiredToken[0].expiresIn).toBeTruthy();
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
        return (
            request(app.getHttpServer())
                .get("/api/auth/logout")
                .set("Authorization", `Bearer ${newToken}`)
                // eslint-disable-next-line sonarjs/no-identical-functions
                .then(async (response) => {
                    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
                    expect(isInstanceOfError(await response.body)).toBeTruthy();
                    const errMsg = <IErrorRequest>response.body;
                    expect(errMsg.message).toBe("Wrong headers.authorization");
                })
        );
    });

    it("- GET USER Info (already logout)", async () => {
        return (
            request(app.getHttpServer())
                .get("/api/auth/info")
                .set("Authorization", `Bearer ${newToken}`)
                // eslint-disable-next-line sonarjs/no-identical-functions
                .then(async (response) => {
                    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
                    expect(isInstanceOfError(await response.body)).toBeTruthy();
                    const errMsg = <IErrorRequest>response.body;
                    expect(errMsg.message).toBe("Wrong headers.authorization");
                })
        );
    });

    afterAll(async () => {
        await finalizeAfter("User");
    });
});
