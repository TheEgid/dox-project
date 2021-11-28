import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import UploadDocService from "./uploadDoc.service";

@Controller("api/upload")
export default class UploadDocController {
  constructor(private readonly uploadDocService: UploadDocService) {}

  @Post("/upload")
  @UseInterceptors(FileInterceptor("customfile"))
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
          message: "only .pdf format allowed",
          error: "UNSUPPORTED_MEDIA_TYPE",
        },
        HttpStatus.UNSUPPORTED_MEDIA_TYPE
      );
    }
    const processed = await this.uploadDocService.getfileProcess(file.path);
    return <string>JSON.parse(processed.stdout);
  }
}
