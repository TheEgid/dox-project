import { HttpStatus, INestApplication } from "@nestjs/common";
import request from "supertest";
import { initializeBefore } from "./fixture.common";

describe("Root [end-to-end]", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initializeBefore();
  });

  it("+ GET status", async () => {
    return request(app.getHttpServer())
      .get("/api/status")
      .then((response) => {
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toStrictEqual({ status: "OK" });
      });
  });
});
