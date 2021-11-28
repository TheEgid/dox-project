import { HttpStatus, INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { configConnection, connectionOptions } from "../src/database/database.config";
import request from "supertest";
import AppModule from "../src/app.module";
import { DocumentDto } from "../src/document/document.dto";

describe("Root [End To End]", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          Object.assign(
            connectionOptions,
            {
              logging: false,
            },
            configConnection()
          )
        ),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api");
    // userRepository = moduleFixture.get(UserRepository);
    // productRepository = moduleFixture.get(ProductRepository);
    await app.init();
  });

  it("GET /api/status", async () => {
    return request(app.getHttpServer())
      .get("/api/status")
      .then((response) => {
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toStrictEqual({ status: "OK" });
      });
  });

  it("POST /api/document/create", async () => {
    const isDocumentDto = (object): object is DocumentDto => !!object && "id" in object;
    return request(app.getHttpServer())
      .post("/api/document/create")
      .send({
        userHiddenName: "testUserHiddenName",
        filename: "testfilename",
        content: "testcontent",
        docType: "",
      })
      .then((response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(isDocumentDto(response.body)).toBe(true);
      });
  });

  afterAll((done) => {
    done();
  });
});
