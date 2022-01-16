import * as sinon from "sinon";
import { Repository } from "typeorm";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import Document from "../src/document/document.entity";
import DocumentService from "../src/document/document.service";
import { UpdateDocumentDto } from "../src/document/document.dto";

describe("Document SinonSandbox", () => {
    let documentService: DocumentService;
    let sinonSandbox: sinon.SinonSandbox;

    const documentOneObject: UpdateDocumentDto = {
        id: 1,
        userHiddenName: "test",
        createdAt: new Date(),
        filename: "test",
        content: "test",
        docType: "test",
    };

    beforeAll(async () => {
        sinonSandbox = sinon.createSandbox();
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

    it("documentService.createDocument", async () => {
        const spy = jest.spyOn(documentService, "createDocument");
        await documentService.createDocument(documentOneObject);
        expect(spy).toHaveBeenCalledWith(expect.objectContaining(documentOneObject));
    });

    it("documentService.updateDocument", async () => {
        const spy = jest.spyOn(documentService, "updateDocument");
        await documentService.updateDocument(documentOneObject);
        expect(spy).toHaveBeenCalledWith(expect.objectContaining(documentOneObject));
    });

    it("documentService.getDocumentById", async () => {
        const spy = jest.spyOn(documentService, "getDocumentById");
        await documentService.getDocumentById(documentOneObject.id);
        expect(spy).toHaveBeenCalledWith(1);
    });

    it("documentService.getAllDocument", async () => {
        const spy = jest.spyOn(documentService, "getAllDocument");
        await documentService.getAllDocument();
        expect(spy).toHaveBeenCalledWith();
    });

    it("documentService.deleteDocument", async () => {
        const spy = jest.spyOn(documentService, "deleteDocument");
        await documentService.deleteDocument(documentOneObject.id);
        expect(spy).toHaveBeenCalledWith(1);
    });

    afterAll((done) => {
        sinonSandbox.restore();
        done();
    });
});
