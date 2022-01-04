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
  let documentId: number;

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
        documentId = createdDocument.id;
      });
  });

  it("+ GET document/get:id", async () => {
    return request(app.getHttpServer())
      .get(`/api/document/get/${documentId}`)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        expect(isInstanceOfDocumentDto(await response.body)).toBeTruthy();
        const jsonContent = <UpdateDocumentDto>response.body;
        expect(jsonContent.id).toBe(documentId);
      });
  });

  it("- GET document/get:id", async () => {
    return request(app.getHttpServer())
      .get(`/api/document/get/${documentId * 200}`)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.NOT_FOUND);
        expect(isInstanceOfDocumentDto(await response.body)).toBeFalsy();
        expect(isInstanceOfError(await response.body)).toBeTruthy();
        const errMsg = <IErrorRequest>response.body;
        // eslint-disable-next-line sonarjs/no-duplicate-string
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
        docs.forEach((doc) => expect(isInstanceOfDocumentDto(doc)).toBeTruthy());
      });
  });

  it("+ PUT document/update:id", async () => {
    return request(app.getHttpServer())
      .put(`/api/document/update/${documentId}`)
      .send(docUpdated)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        expect(isInstanceOfDocumentDto(await response.body)).toBeTruthy();
        const jsonContent = <UpdateDocumentDto>response.body;
        expect(jsonContent.id).toEqual(documentId);
        expect(jsonContent.docType).toEqual(docUpdated.docType);
        expect(jsonContent.createdAt < jsonContent.updatedAt).toBeTruthy();
      });
  });

  it("- PUT document/update:id", async () => {
    return (
      request(app.getHttpServer())
        .put(`/api/document/update/${documentId * 200}`)
        .send(docUpdated)
        // eslint-disable-next-line sonarjs/no-identical-functions
        .then(async (response) => {
          expect(response.status).toBe(HttpStatus.NOT_FOUND);
          expect(isInstanceOfDocumentDto(await response.body)).toBeFalsy();
          expect(isInstanceOfError(await response.body)).toBeTruthy();
          const errMsg = <IErrorRequest>response.body;
          expect(errMsg.message).toBe("NOT_FOUND Error");
        })
    );
  });

  it("+ DELETE document/delete:id", async () => {
    return request(app.getHttpServer())
      .delete(`/api/document/delete/${documentId}`)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        expect(await response.body).toStrictEqual({ deletedId: String(documentId) });
        const deletedDocument = await documentRepo.findOne({
          where: { id: documentId },
        });
        expect(deletedDocument).toBeUndefined();
      });
  });

  it("- DELETE document/delete:id", async () => {
    return request(app.getHttpServer())
      .delete(`/api/document/delete/${documentId * 200}`)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.NOT_FOUND);
        expect(isInstanceOfError(await response.body)).toBeTruthy();
        const errMsg = <IErrorRequest>response.body;
        expect(errMsg.message).toBe("NOT_FOUND Error");
      });
  });

  afterAll(async () => {
    await finalizeAfter("Document");
  });
});
