import * as child from "child_process";
import * as path from "path";
import { promisify } from "util";
import { Injectable } from "@nestjs/common";
import { DocumentDto } from "../document/document.dto";
import DocumentService from "../document/document.service";

interface ISuccess {
  docxPath: string;
  fileContent: string;
}

@Injectable()
export default class UploadDocService {
  constructor(private readonly documentService: DocumentService) {}

  execeed = promisify(child.exec);

  async getfileProcess(filePath: string, currentUser?: string): Promise<string> {
    let docObject: DocumentDto;
    const commandPath = path.join(__dirname, "../..", "py_child", "uploads_main.py");
    const res = await this.execeed(`python ${commandPath} ${filePath}`);
    if (res) {
      const parsed = <ISuccess>JSON.parse(res.stdout);
      docObject = {
        userHiddenName: currentUser || "anonymous",
        filename: path.parse(parsed.docxPath).base,
        content: parsed.fileContent,
        docType: "docx",
      };
    }
    await this.documentService.createDocument(docObject);
    return res.stdout;
  }
}
