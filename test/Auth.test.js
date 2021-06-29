import app from "../src/app.js";
import jest from "jest";
import supertest from "supertest";
import connection from "../src/database.js";

describe("POST /sign-up", () => {
  beforeEach(async () => {
    await connection.query("DELETE FROM users");
  });
  afterAll(() => {
    connection.end();
  });
  it("returns 201 for validate params", async () => {
    const body = {
      name: "Test",
      email: "test@test.br",
      password: "1234"
    };
    const result = await supertest(app).post("/sign-up").send(body);
    console.log(result);
    expect(result.status).toEqual(201);
  });
});
