import app from "../src/app.js";
import jest from "jest";
import supertest from "supertest";
import connection from "../src/database.js";

beforeEach(async () => {
  await connection.query("DELETE FROM users");
});
afterAll(() => {
  connection.end();
});

describe("POST /sign-up", () => {
  it("returns 201 for validate params", async () => {
    const body = {
      name: "Test",
      email: "test@test.com",
      password: "1234",
    };
    const result = await supertest(app).post("/sign-up").send(body);
    console.log(result);
    expect(result.status).toEqual(201);
  });
  it("returns 409 for duplicate email", async () => {
    const body = {
      name: "Test",
      email: "test@test.com",
      password: "1234",
    };
    const result = await supertest(app).post("/sign-up").send(body);
    expect(result.status).toEqual(201);

    const secondTry = await supertest(app).post("/sign-up").send(body);
    expect(secondTry.status).toEqual(409);
  });
  it("returns 400 for invalidate email", async () => {
    const body = {
      name: "Test",
      email: "test",
      password: "1234",
    };
    const result = await supertest(app).post("/sign-up").send(body);
    expect(result.status).toEqual(400);
  });

  it("returns 400 for invalidate password", async () => {
    const body = {
      name: "Test",
      email: "test@test.com",
      password: "",
    };
    const result = await supertest(app).post("/sign-up").send(body);
    expect(result.status).toEqual(400);
  });

  it("returns 400 for invalidate name", async () => {
    const body = {
      name: 1234,
      email: "test@test.com",
      password: "1234",
    };
    const result = await supertest(app).post("/sign-up").send(body);
    expect(result.status).toEqual(400);
  });
});

describe("POST /sign-in", () => {
  it("returns 201 for validate params", async () => {
    const bodySignUp = {
      name: "Test",
      email: "test@test.com",
      password: "1234",
    };
    const bodySignIn = {
      email: "test@test.com",
      password: "1234",
    };
    await supertest(app).post("/sign-up").send(bodySignUp);
    const result = await supertest(app).post("/sign-in").send(bodySignIn);
    console.log(result);
    expect(result.status).toEqual(200);
  });
  it("returns 400 for invalid params", async () => {
    const bodySignUp = {
      name: "Test",
      email: "test@test.com",
      password: "1234",
    };
    const bodySignIn = {
      email: "test@test.com",
      password: "",
    };
    await supertest(app).post("/sign-up").send(bodySignUp);
    const result = await supertest(app).post("/sign-in").send(bodySignIn);
    console.log(result);
    expect(result.status).toEqual(400);
  });

  it("returns 401 for incorrect password", async () => {
    const bodySignUp = {
      name: "Test",
      email: "test@test.com",
      password: "1234",
    };
    const bodySignIn = {
      email: "test@test.com",
      password: "6",
    };
    await supertest(app).post("/sign-up").send(bodySignUp);
    const result = await supertest(app).post("/sign-in").send(bodySignIn);
    console.log(result);
    expect(result.status).toEqual(401);
  });
  it("returns 404 for unregistered email", async () => {
    const bodySignIn = {
      email: "test@test.com",
      password: "1234",
    };
    const result = await supertest(app).post("/sign-in").send(bodySignIn);
    console.log(result);
    expect(result.status).toEqual(404);
  });
});
