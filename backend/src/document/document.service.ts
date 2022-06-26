import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DocumentDto, UpdateDocumentDto } from "./document.dto";
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
        return this.documentRepository.findOneBy({ id: id });
    }

    async createDocument(createDocumentDto: DocumentDto) {
        return this.documentRepository.save(createDocumentDto);
    }

    async updateDocument(updateDocumentDto: UpdateDocumentDto) {
        const id = updateDocumentDto.id;
        await this.documentRepository.update(id, updateDocumentDto);
        return this.documentRepository.findOneBy({ id: id });
    }

    async deleteDocument(id: number) {
        await this.documentRepository.delete(id);
    }
}
