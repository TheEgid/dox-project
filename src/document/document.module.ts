import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import Document from "./document.entity";
import DocumentController from "./document.controller";
import DocumentService from "./document.service";

@Module({
  imports: [TypeOrmModule.forFeature([Document])],
  exports: [DocumentService],
  controllers: [DocumentController],
  providers: [DocumentService],
})
export default class DocumentModule {}
