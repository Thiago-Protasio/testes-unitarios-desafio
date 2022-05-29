import { hash } from "bcryptjs";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import request from "supertest";
import createConnection from "./../../../../database";
import { app } from "../../../../app";

let connection: Connection;

describe("Authenticate user", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("123456", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
        values('${id}', 'test', 'test@test.com', '${password}', 'now()', 'now()')
      `
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to authenticate an user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "123456"
    });

    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("user");
    expect(response.status).toBe(200);
  });

  it("Should not be able to authenticate if the email is incorrect", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "incorrect@test.com",
      password: "123456"
    });

    expect(response.status).toBe(401);
  });

  it("Should not be able to authenticate if the password is incorrect", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "1234"
    });

    expect(response.status).toBe(401);
  });
});
