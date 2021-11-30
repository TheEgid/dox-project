import { HttpStatus, INestApplication } from "@nestjs/common";
import * as fs from "fs";
import path from "path";
import request from "supertest";
import { initializeBefore } from "./fixture.common";

interface IerrJson {
  statusCode: number;
  message: string;
  error: string;
}

interface IssuccessJson {
  docxPath: string;
  fileContent: string;
}

const isInstanceOfSuccessJson = (object: any): object is IssuccessJson => "fileContent" in object;
const isInstanceOfErrorJson = (object: any): object is IerrJson => "error" in object;

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
        expect(isInstanceOfSuccessJson(await response.body)).toBeTruthy();

        const jsonContent = <IssuccessJson>response.body;
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
        expect(isInstanceOfErrorJson(await response.body)).toBeTruthy();
        const errMsg = <IerrJson>response.body;
        expect(errMsg.message).toBe("only .pdf format allowed");
      });
  });
});
