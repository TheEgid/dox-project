import Document from "../src/document/document.entity";
import { DocumentDto, UpdateDocumentDto } from "../src/document/document.dto";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { finalizeAfter, IErrorRequest, initializeBefore } from "./fixture.common";
import request from "supertest";
import { getConnection, Repository } from "typeorm";

const docObject: DocumentDto = {
  userHiddenName: "test",
  filename: "test",
  content: "test",
  docType: "test",
};

const docUpdated: DocumentDto = {
  userHiddenName: "test",
  filename: "test",
  content: "test",
  docType: "this field has updated",
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
      .send(docObject)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(isInstanceOfDocumentDto(await response.body)).toBeTruthy();
        const jsonContent = <UpdateDocumentDto>response.body;
        expect(jsonContent.filename).toBe(docObject.filename);
        const createdDocument = await documentRepo.findOne({
          order: { createdAt: "DESC" },
        });
        expect(createdDocument.filename).toBe(docObject.filename);
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

  it("+ GET document/get", async () => {
    return request(app.getHttpServer())
      .get("/api/document/get")
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        expect(await response.body).toBeInstanceOf(Array);
        const docs = <DocumentDto[]>response.body;
        for (const doc of docs) {
          expect(isInstanceOfDocumentDto(doc)).toBeTruthy();
        }
      });
  });

  it("+ PUT document/update:id", async () => {
    return request(app.getHttpServer())
      .put(`/api/document/update/${documentOneObjectId}`)
      .send(docUpdated)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        expect(isInstanceOfDocumentDto(await response.body)).toBeTruthy();
        const jsonContent = <UpdateDocumentDto>response.body;
        expect(jsonContent.id).toEqual(documentOneObjectId);
        expect(jsonContent.docType).toEqual(docUpdated.docType);
        expect(jsonContent.createdAt < jsonContent.updatedAt).toBeTruthy();
      });
  });

  it("- PUT document/update:id", async () => {
    return request(app.getHttpServer())
      .put(`/api/document/update/${documentOneObjectId * 200}`)
      .send(docUpdated)
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

// {
//   id: 326,
//     userHiddenName: 'test',
//   createdAt: '2021-12-05T11:44:48.988Z',
//   updatedAt: '2021-12-05T11:44:49.163Z',
//   filename: 'test',
//   content: 'test',
//   docType: 'test2'
// }
