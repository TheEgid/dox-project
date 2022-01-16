import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class HealthcheckMiddleware implements NestMiddleware {
    use(request: Request, response: Response): void {
        response.json({ status: "OK" });
    }
}

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
    private logger = new Logger("HTTP");

    use(request: Request, response: Response, next: NextFunction): void {
        const { method, path: url } = request;
        response.on("close", () => {
            const { statusCode } = response;
            const contentLength = response.get("content-length");
            this.logger.log(`${method} ${url} ${statusCode} ${contentLength}`);
        });
        next();
    }
}
