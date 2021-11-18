import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";

@Injectable()
export class HealthcheckMiddleware implements NestMiddleware {
  use(req: Request, res: Response) {
    res.json({ status: "OK" });
  }
}
