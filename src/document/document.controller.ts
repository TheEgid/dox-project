import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import CreateDocumentDto from "./dto/document.dto.create";
import UpdateDocumentDto from "./dto/document.dto.update";
import DocumentDto from "./dto/document.dto";
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
      name: userDto.name,
      age: userDto.age,
    };

    return this.documentService.createDocument(createDocumentDto);
  }

  @Put("update/:id")
  updateDocument(@Param("id") id: number, @Body() documentDto: DocumentDto) {
    const updateDocumentDto: UpdateDocumentDto = {
      id,
      name: documentDto.name,
      age: documentDto.age,
    };
    return this.documentService.updateDocument(updateDocumentDto);
  }

  @Delete("delete/:id")
  deleteUser(@Param("id") id: number) {
    return this.documentService.deleteDocument(id);
  }
}
