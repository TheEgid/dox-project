import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import getUploadFilesConfig from "./uploadDoc.config";
import UploadDocService from "./uploadDoc.service";
import UploadDocController from "./uploadDoc.controller";

@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: () => getUploadFilesConfig(),
    }),
  ],
  exports: [UploadDocService],
  providers: [UploadDocService],
  controllers: [UploadDocController],
})
export default class UploadDocModule {}
