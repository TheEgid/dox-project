import {
  Controller,
  Headers,
  HttpException,
  HttpStatus,
  Injectable,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import UserDto from "../user/user.dto";
import UserService from "../user/user.service";
import UploadDocService from "./uploadDoc.service";

interface AuthHeaders {
  authorization: string;
}

const replacer = (string, pattern1: string, pattern2: string) =>
  pattern1.concat("*".repeat(pattern2.length));

const hideEmail = (email: string) =>
  email
    .replace(/(^.{2})(.+?)(?=@)/g, replacer)
    .replace(/(^.+@.)(.+?)(?=\.)/g, replacer)
    .replace(/(\.)(.+?)(?=$)/g, replacer);

@Injectable()
@Controller("upload")
export default class UploadDocController {
  private currentUser: string;

  constructor(
    private readonly userService: UserService,
    private readonly uploadDocService: UploadDocService
  ) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("customfile"))
  async uploadDocument(@Headers() headers: AuthHeaders, @UploadedFile() file: Express.Multer.File) {
    if (headers.authorization) {
      const authorizationHeader = headers.authorization;
      const header = authorizationHeader.split(" ", 2);
      const [, inputToken] = header;
      const curUser = await this.userService.getUserByToken(inputToken);
      if (curUser instanceof UserDto) {
        this.currentUser = hideEmail(curUser.email);
      } else {
        this.currentUser = "anonymous";
      }
    }

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

    const processed = await this.uploadDocService.getfileProcess(file.path, this.currentUser);

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
