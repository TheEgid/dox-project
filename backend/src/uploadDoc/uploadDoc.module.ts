import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import getUploadFilesConfig from "./uploadDoc.config";
import UploadDocService from "./uploadDoc.service";
import UploadDocController from "./uploadDoc.controller";
import UserService from "../user/user.service";
import TokenService from "../token/token.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import User from "../user/user.entity";
import Token from "../token/token.entity";
import Document from "../document/document.entity";
import DocumentService from "../document/document.service";

@Module({
    imports: [
        MulterModule.registerAsync({
            useFactory: () => getUploadFilesConfig(),
        }),
        TypeOrmModule.forFeature([User, Token, Document]),
    ],
    exports: [UploadDocService],
    providers: [UserService, TokenService, DocumentService, UploadDocService],
    controllers: [UploadDocController],
})
export default class UploadDocModule {}
