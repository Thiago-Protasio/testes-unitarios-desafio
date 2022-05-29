import createConnection from "./../../../../database";
import request from "supertest";
import { v4 as uuidV4 } from "uuid";
import { Connection } from "typeorm";
import { hash } from "bcryptjs";
import { app } from "../../../../app";

let connection: Connection;

describe("Get Statement Operation", () => {
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

  it("Should be able to return a statement operation", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "123456"
    });

    const { token } = responseToken.body;

    const responseDeposit = await request(app).post("/api/v1/statements/deposit").send({
      amount: 100,
      description: "test deposit"
    }).set({
      Authorization: `Bearer ${token}`
    });

    const response = await request(app).get(`/api/v1/statements/${responseDeposit.body.id}`).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  it("Should be not be able to return a statement if the token is incorrect", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "123456"
    });

    const { token } = responseToken.body;

    const responseDeposit = await request(app).post("/api/v1/statements/deposit").send({
      amount: 100,
      description: "test deposit 2"
    }).set({
      Authorization: `Bearer ${token}`
    });

    const incorrectToken = "invalid token";

    const response = await request(app).get(`/api/v1/statements/${responseDeposit.body.id}`).set({
      Authorization: `Bearer ${incorrectToken}`
    });

    expect(response.status).toBe(401);
  });

  it("Should not be able to return a statement if the statement id is incorrect", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "123456"
    });

    const { token } = responseToken.body;

    const incorrectStatementId = "016d9b2e-a163-4ee2-86bf-6f0740b59670"

    const response = await request(app).get(`/api/v1/statements/${incorrectStatementId}`).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(404);
  });
});
