import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DocumentDto, CreateDocumentDto, UpdateDocumentDto } from "./document.dto";
import Document from "./document.entity";

@Injectable()
export default class DocumentService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>
  ) {}

  async getAllDocument() {
    return this.documentRepository.find();
  }

  async getDocumentById(id: number) {
    return this.documentRepository.findOne(id);
  }

  async createDocument(createDocumentDto: CreateDocumentDto) {
    return this.documentRepository.save(createDocumentDto);
  }

  async updateDocument(updateDocumentDto: UpdateDocumentDto) {
    const id = updateDocumentDto.id;

    const documentDto: DocumentDto = {
      userHiddenName: updateDocumentDto.userHiddenName,
      createdAt: updateDocumentDto.createdAt,
      filename: updateDocumentDto.filename,
      content: updateDocumentDto.content,
      docType: updateDocumentDto.docType,
    };

    await this.documentRepository.update(id, documentDto);
    return this.documentRepository.findOne(id);
  }

  async deleteDocument(id: number) {
    await this.documentRepository.delete(id);
    return `Deleted Document with id ${id}`;
  }
}
