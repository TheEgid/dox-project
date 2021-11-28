import * as child from "child_process";
import * as path from "path";
import { promisify } from "util";

export default class UploadDocService {
  execeed = promisify(child.exec);

  async getfileProcess(filePath: string) {
    const commandPath = path.join(__dirname, "../..", "py_child", "uploads_main.py");
    return this.execeed(`python ${commandPath} ${filePath}`);
  }
}
