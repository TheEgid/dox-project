import { HttpStatus, INestApplication } from "@nestjs/common";
import * as fs from "fs";
import path from "path";
import request from "supertest";
import { IerrorRequest, initializeBefore } from "./fixture.common";

interface Isuccess {
  docxPath: string;
  fileContent: string;
}

const isInstanceOfSuccess = (object: any): object is Isuccess => "fileContent" in object;
const isInstanceOfError = (object: any): object is IerrorRequest => "error" in object;

describe("Upload PDF File [end-to-end]", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initializeBefore();
  });

  it("positive POST upload", async () => {
    const filePath = path.join(__dirname, "testFiles", "test upload.pdf");
    if (!fs.existsSync(filePath)) throw Error(`${filePath} not exists!`);

    return request(app.getHttpServer())
      .post("/api/upload/upload")
      .attach("customfile", filePath)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(isInstanceOfSuccess(await response.body)).toBeTruthy();

        const jsonContent = <Isuccess>response.body;
        expect(jsonContent.docxPath.endsWith("docx")).toBeTruthy();
        expect(jsonContent.fileContent.length !== 0).toBeTruthy();
        expect(fs.existsSync(jsonContent.docxPath)).toBeTruthy();
        expect(jsonContent.docxPath.indexOf("86e625c6") > 0).toBeTruthy();
      });
  });

  it("negative POST upload", async () => {
    const filePath = path.join(__dirname, "testFiles", "addresses.7z");
    if (!fs.existsSync(filePath)) throw Error(`${filePath} not exists!`);
    return request(app.getHttpServer())
      .post("/api/upload/upload")
      .attach("customfile", filePath)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
        expect(isInstanceOfError(await response.body)).toBeTruthy();
        const errMsg = <IerrorRequest>response.body;
        expect(errMsg.message).toBe("only .pdf format allowed");
      });
  });
});
