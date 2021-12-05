import Document from "../src/document/document.entity";
import { DocumentDto, UpdateDocumentDto } from "../src/document/document.dto";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { finalizeAfter, IErrorRequest, initializeBefore } from "./fixture.common";
import request from "supertest";
import { getConnection, Repository } from "typeorm";

const documentOneObject: DocumentDto = {
  userHiddenName: "test",
  createdAt: new Date(),
  filename: "test",
  content: "test",
  docType: "test",
};

const isInstanceOfDocumentDto = (object: any): object is DocumentDto => "content" in object;
const isInstanceOfError = (object: any): object is IErrorRequest => "error" in object;

describe("Document [end-to-end]", () => {
  let app: INestApplication;
  let documentRepo: Repository<Document>;
  let documentOneObjectId: number;

  beforeAll(async () => {
    app = await initializeBefore();
    documentRepo = getConnection(process.env.DB_NAME).getRepository(Document);
  });

  it("+ POST document/create", async () => {
    return request(app.getHttpServer())
      .post("/api/document/create")
      .send(documentOneObject)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(isInstanceOfDocumentDto(await response.body)).toBeTruthy();
        const jsonContent = <UpdateDocumentDto>response.body;
        expect(jsonContent.filename).toBe(documentOneObject.filename);
        const createdDocument = await documentRepo.findOne({
          order: { createdAt: "DESC" },
        });
        expect(createdDocument.filename).toBe(documentOneObject.filename);
        documentOneObjectId = createdDocument.id;
      });
  });

  it("+ GET document/get:id", async () => {
    return request(app.getHttpServer())
      .get(`/api/document/get/${documentOneObjectId}`)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        expect(isInstanceOfDocumentDto(await response.body)).toBeTruthy();
        const jsonContent = <UpdateDocumentDto>response.body;
        expect(jsonContent.id).toBe(documentOneObjectId);
      });
  });

  it("- GET document/get:id", async () => {
    return request(app.getHttpServer())
      .get(`/api/document/get/${documentOneObjectId * 200}`)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.NOT_FOUND);
        expect(isInstanceOfDocumentDto(await response.body)).toBeFalsy();
        expect(isInstanceOfError(await response.body)).toBeTruthy();
        const errMsg = <IErrorRequest>response.body;
        expect(errMsg.message).toBe("NOT_FOUND Error");
      });
  });

  afterAll(async () => {
    await finalizeAfter("Document");
  });
});

// console.log(jsonContent);
// .toBeInstanceOf(Array);
