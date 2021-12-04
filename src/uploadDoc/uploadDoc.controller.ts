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

@Controller("upload")
export default class UploadDocController {
  constructor(private readonly uploadDocService: UploadDocService) {}

  @Post("upload")
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
    const tempProcessed = await this.uploadDocService.getfileProcess(file.path);
    const processed = tempProcessed.stdout;
    if (processed.includes("Error")) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: "Content Error",
          error: "UNPROCESSABLE_ENTITY",
        },
        HttpStatus.UNPROCESSABLE_ENTITY
      );
    }
    return <string>JSON.parse(processed);
  }
}
