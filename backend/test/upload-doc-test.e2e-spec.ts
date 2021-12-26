import { HttpStatus, INestApplication } from "@nestjs/common";
import { IErrorRequest, initializeBefore } from "./fixture.common";
import * as fs from "fs";
import path from "path";
import request from "supertest";
import { getConnection, Repository } from "typeorm";
import Document from "../src/document/document.entity";

interface ISuccess {
  docxPath: string;
  fileContent: string;
}

const createEmptyFileOfSize = (fileName: string, size: number) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const fd = fs.openSync(fileName, "w");
        if (size > 0) {
          fs.writeSync(fd, Buffer.alloc(1), 0, 1, size - 1);
        }
        fs.closeSync(fd);
        resolve(true);
      } catch (error) {
        reject(error);
      }
    }, 0);
  });
};

const isInstanceOfSuccess = (object: any): object is ISuccess => "fileContent" in object;
const isInstanceOfError = (object: any): object is IErrorRequest => "error" in object;

describe("Upload PDF File [end-to-end]", () => {
  let app: INestApplication;
  let documentRepo: Repository<Document>;

  beforeAll(async () => {
    app = await initializeBefore();
    documentRepo = getConnection(process.env.DB_NAME).getRepository(Document);
  });

  it("+ POST upload", async () => {
    const filePath = path.join(__dirname, "testFiles", "test upload.pdf");

    if (!fs.existsSync(filePath)) throw Error(`${filePath} not exists!`);

    return request(app.getHttpServer())
      .post("/api/upload/upload")
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

  it("- POST upload (not .pdf document)", async () => {
    const filePath = path.join(__dirname, "testFiles", "addresses.7z");

    if (!fs.existsSync(filePath)) throw Error(`${filePath} not exists!`);

    return request(app.getHttpServer())
      .post("/api/upload/upload")
      .attach("customfile", filePath)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
        expect(isInstanceOfError(await response.body)).toBeTruthy();
        const errMsg = <IErrorRequest>response.body;
        expect(errMsg.message).toBe("only .pdf format allowed");
      });
  });

  it("- POST upload (so big .pdf document)", async () => {
    const filePath = path.join(__dirname, "testFiles", "sampleBig.pdf");

    if (!fs.existsSync(filePath)) {
      await createEmptyFileOfSize(filePath, 1024 * 1024 * 12);
    }

    expect(fs.existsSync(filePath)).toBeTruthy();
    return request(app.getHttpServer())
      .post("/api/upload/upload")
      .attach("customfile", filePath)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.PAYLOAD_TOO_LARGE);
        expect(isInstanceOfError(await response.body)).toBeTruthy();
        const errMsg = <IErrorRequest>response.body;
        expect(errMsg.message).toBe("File too large");
      });
  });

  it("- POST upload (> 100 pages .pdf document)", async () => {
    const filePath = path.join(__dirname, "testFiles", "108pages.pdf");

    expect(fs.existsSync(filePath)).toBeTruthy();

    return request(app.getHttpServer())
      .post("/api/upload/upload")
      .attach("customfile", filePath)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(isInstanceOfError(await response.body)).toBeTruthy();
        const errMsg = <IErrorRequest>response.body;
        expect(errMsg.message).toBe("Content Error");
      });
  });
});
