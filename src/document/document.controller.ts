import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { DocumentDto, UpdateDocumentDto } from "./document.dto";
import DocumentService from "./document.service";

@Controller("document")
export default class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get("get")
  async getAllDocument() {
    return this.documentService.getAllDocument();
  }

  @Get("get/:id")
  async getDocumentById(@Param("id") id: number) {
    return this.documentService.getDocumentById(id);
  }

  @Post("create")
  async createDocument(@Body() userDto: DocumentDto) {
    return this.documentService.createDocument(userDto);
  }

  @Put("update/:id")
  async updateDocument(@Param("id") id: number, @Body() documentDto: DocumentDto) {
    const updatedDocument = await this.documentService.getDocumentById(id);
    if (updatedDocument === undefined) {
      return undefined;
    }
    const updateDocumentDto = Object.assign(
      { id: updatedDocument.id, createdAt: updatedDocument.createdAt },
      documentDto
    );
    return this.documentService.updateDocument(<UpdateDocumentDto>updateDocumentDto);
  }

  @Delete("delete/:id")
  async deleteDocument(@Param("id") id: number) {
    return this.documentService.deleteDocument(id);
  }
}
