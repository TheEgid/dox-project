import Document from "../src/document/document.entity";
import { DocumentDto, UpdateDocumentDto } from "../src/document/document.dto";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { finalizeAfter, initializeBefore } from "./fixture.common";
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

  it("+ GET document/get", async () => {
    return request(app.getHttpServer())
      .get(`/api/document/get/${documentOneObjectId}`)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);
        expect(isInstanceOfDocumentDto(await response.body)).toBeTruthy();
        const jsonContent = <UpdateDocumentDto>response.body;
        expect(jsonContent.id).toBe(documentOneObjectId);
      });
  });

  it("- GET document/get", async () => {
    return (
      request(app.getHttpServer())
        .get(`/api/document/get/${documentOneObjectId * 200}`)
        // eslint-disable-next-line @typescript-eslint/require-await
        .then(async (response) => {
          expect(response.status).toBe(HttpStatus.OK);
          expect(isInstanceOfDocumentDto(await response.body)).toBeFalsy();
          const jsonContent = <UpdateDocumentDto>response.body;
          expect(jsonContent).toBeUndefined();
          // const createdDocument = await documentRepo.findOne({
          //   order: { createdAt: "DESC" },
          // });
          // expect(createdDocument.filename).toBe(documentOneObject.filename);
          // documentOneObjectId = createdDocument.id;
          console.log(jsonContent);
        })
    );
  });

  afterAll(async () => {
    await finalizeAfter("Document");
  });
});

// console.log(jsonContent);
// .toBeInstanceOf(Array);
