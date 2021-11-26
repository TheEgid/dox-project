import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { DocumentDto, CreateDocumentDto, UpdateDocumentDto } from "./document.dto";
import DocumentService from "./document.service";

@Controller("api/document")
export default class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get("get")
  getAllDocument() {
    return this.documentService.getAllDocument();
  }

  @Get("get/:id")
  getDocumentById(@Param("id") id: number) {
    return this.documentService.getDocumentById(id);
  }

  @Post("create")
  createDocument(@Body() userDto: DocumentDto) {
    const createDocumentDto: CreateDocumentDto = {
      userHiddenName: userDto.userHiddenName,
      createdAt: userDto.createdAt,
      filename: userDto.filename,
      content: userDto.content,
      docType: userDto.docType,
    };

    return this.documentService.createDocument(createDocumentDto);
  }

  @Put("update/:id")
  updateDocument(@Param("id") id: number, @Body() documentDto: DocumentDto) {
    const updateDocumentDto: UpdateDocumentDto = {
      id,
      userHiddenName: documentDto.userHiddenName,
      createdAt: documentDto.createdAt,
      filename: documentDto.filename,
      content: documentDto.content,
      docType: documentDto.docType,
    };
    return this.documentService.updateDocument(updateDocumentDto);
  }

  @Delete("delete/:id")
  deleteUser(@Param("id") id: number) {
    return this.documentService.deleteDocument(id);
  }
}
