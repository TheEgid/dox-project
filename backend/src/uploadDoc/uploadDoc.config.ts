import { Request } from "express";
import { diskStorage } from "multer";
import { join } from "path";
import hashSum from "hash-sum";

const pdfFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: (error: Error, filename: boolean) => void
) => {
  if (file.mimetype === "application/pdf" || file.mimetype === "application/x-pdf") {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

const getUploadFilesConfig = () => {
  return {
    storage: diskStorage({
      destination: join(__dirname, "../../UPLOAD/"),
      filename: (req, file, callback) => {
        callback(null, `${hashSum(file.originalname)}.pdf`);
      },
    }),
    limits: {
      fileSize: 10485760, // 10 MB
    },
    fileFilter: pdfFilter,
  };
};

export default getUploadFilesConfig;
