import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response } from "express";

@Injectable()
export class HealthcheckMiddleware implements NestMiddleware {
  use(req: Request, res: Response) {
    res.json({ status: "OK" });
  }
}

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  private logger = new Logger("HTTP");
  use(request: Request, response: Response) {
    const { ip, method, path: url } = request;
    const userAgent = request.get("user-agent") || "";
    response.on("close", () => {
      const { statusCode } = response;
      const contentLength = response.get("content-length");
      this.logger.log(`${method} ${url} ${statusCode} ${contentLength} - ${userAgent} ${ip}`);
    });
  }
}
