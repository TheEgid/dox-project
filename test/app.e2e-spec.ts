import { HttpStatus, INestApplication } from "@nestjs/common";
import request from "supertest";
import { DocumentDto } from "../src/document/document.dto";
import { finalizeAfter, initializeBefore } from "./fixture.common";

describe("Root [end-to-end]", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initializeBefore();
  });

  it("GET status", async () => {
    return request(app.getHttpServer())
      .get("/api/status")
      .then((response) => {
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toStrictEqual({ status: "OK" });
      });
  });

  it("POST document/create", async () => {
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

  afterAll(async () => {
    await finalizeAfter("Document");
  });
});
