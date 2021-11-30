import { HttpStatus, INestApplication } from "@nestjs/common";
import { getConnection, Repository } from "typeorm";
import request from "supertest";
import { finalizeAfter, initializeBefore } from "./fixture.common";
import TokenDto from "../src/token/token.dto";
import User from "../src/user/user.entity";

interface IerrJson {
  statusCode: number;
  message: string;
  error: string;
}

const isInstanceOfErrorJson = (object: any): object is IerrJson => "error" in object;

describe("User [end-to-end]", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initializeBefore();
  });

  const isInstanceOfTokenDto = (object: any): object is TokenDto => "refreshToken" in object;

  const newUser = {
    email: "mocktestusert@mocktestemail.com",
    hashedPassword: "mocktestpassword",
  };

  let newToken;

  // register
  it("positive POST USER signup", async () => {
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
  it("positive POST USER signin", async () => {
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
  it("negative POST USER signup", async () => {
    const repository: Repository<User> = getConnection(process.env.DB_NAME).getRepository(User);
    const userRepeat = await repository.findOne({
      where: { email: "mocktestusert@mocktestemail.com" },
    });
    return request(app.getHttpServer())
      .post("/api/auth/signup")
      .send(newUser)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.NOT_ACCEPTABLE);
        expect(isInstanceOfErrorJson(await response.body)).toBeTruthy();
        const errMsg = <IerrJson>response.body;
        expect(errMsg.message).toBe(`Already signup as ${userRepeat.email}`);
      });
  });

  afterAll(async () => {
    await finalizeAfter("User");
  });
});
