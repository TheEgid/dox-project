import { HttpStatus, INestApplication } from "@nestjs/common";
import request from "supertest";
import { createModuleFixture } from "./common.fixture";
import * as fs from "fs";
import path from "path";
import fileExists from "file-exists";

interface IerrJson {
  statusCode: number;
  message: string;
  error: string;
}

interface IdataJson {
  docxPath: string;
  fileContent: string;
}

const instanceOfSuccessJson = (object: any): object is IdataJson => "fileContent" in object;

describe("Upload PDF File [end-to-end]", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await createModuleFixture();
    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api");
    await app.init();
  });

  it("positive POST upload", async () => {
    const filePath = path.join(__dirname, "testFiles", "test.pdf");
    if (!fs.existsSync(filePath)) throw Error(`${filePath} not exists!`);

    return request(app.getHttpServer())
      .post("/api/upload/upload")
      .attach("customfile", filePath)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(instanceOfSuccessJson(response.body)).toBe(true);

        const jsonContent = <IdataJson>response.body;
        expect(jsonContent.docxPath.endsWith("docx")).toBeTruthy();
        expect(jsonContent.fileContent.length !== 0).toBeTruthy();

        await fileExists(filePath).then((exists) => {
          expect(exists === true).toBeTruthy();
        });
      });
  });

  it("negative POST upload", async () => {
    const filePath = `${__dirname}/testFiles/addresses.7z`;
    if (!fs.existsSync(filePath)) throw Error(`${filePath} not exists!`);

    return request(app.getHttpServer())
      .post("/api/upload/upload")
      .attach("customfile", filePath)
      .then((response) => {
        expect(response.status).toBe(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
        const errMsg = <IerrJson>response.body;
        expect(errMsg.message).toBe("only .pdf format allowed");
      });
  });

  afterAll((done) => {
    done();
  });
});
