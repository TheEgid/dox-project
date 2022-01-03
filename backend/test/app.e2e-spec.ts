import { HttpStatus, INestApplication } from "@nestjs/common";
import request from "supertest";
import { initializeBefore } from "./fixture.common";

describe("Root [end-to-end]", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initializeBefore();
  });

  test("!NODE_ENV is test", () => {
    expect(process.env.NODE_ENV).toBe("test");
  });

  it("+ GET status", async () => {
    return request(app.getHttpServer())
      .get("/api/status")
      .then((response) => {
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toStrictEqual({ status: "OK" });
      });
  });

  it("- GET api/.env", async () => {
    return request(app.getHttpServer())
      .get("/api/.env")
      .then((response) => {
        expect(response.status).toBe(HttpStatus.NOT_FOUND);
      });
  });

  it("- GET .env", async () => {
    return request(app.getHttpServer())
      .get("/.env")
      .then((response) => {
        expect(response.status).toBe(HttpStatus.NOT_FOUND);
      });
  });
});
