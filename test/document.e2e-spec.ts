import * as sinon from "sinon";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import DocumentService from "../src/document/document.service";
import Document from "../src/document/document.entity";
import { DocumentDto } from "../src/document/document.dto";

describe("DocumentService", () => {
  let documentService: DocumentService;
  let sandbox: sinon.SinonSandbox;

  beforeAll(async () => {
    sandbox = sinon.createSandbox();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: getRepositoryToken(Document),
          useValue: sinon.createStubInstance(Repository),
        },
      ],
    }).compile();
    documentService = module.get<DocumentService>(DocumentService);
  });

  it("should call saveDocument", async () => {
    const createDocumentSpy = jest.spyOn(documentService, "createDocument");
    const dto = new DocumentDto();
    await documentService.createDocument(dto);
    expect(createDocumentSpy).toHaveBeenCalledWith(dto);
  });

  afterAll((done) => {
    sandbox.restore();
    done();
  });
});
