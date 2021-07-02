import app from "../src/app.js";
import jest from "jest";
import supertest from "supertest";
import connection from "../src/database.js";
import bcrypt from "bcrypt";

beforeEach(async () => {
  await connection.query("DELETE FROM users");
  await connection.query("DELETE FROM sessions");
  
});
afterAll(() => {
  connection.end();
});

describe("POST /sign-up", () => {
  it("returns 201 for validate params", async () => {
    const body = {
      name: "Tesdt",
      email: "tesdgyygt@test.com",
      password: "1234",
    };
    const result = await supertest(app).post("/sign-up").send(body);
    console.log(result.status);
    expect(result.status).toEqual(201);
  });
  it("returns 409 for duplicate email", async () => {
    const body = {
      name: "Test",
      email: "test@test.com",
      password: "1234",
    };
    await supertest(app).post("/sign-up").send(body);
    const secondTry = await supertest(app).post("/sign-up").send(body);
    console.log(secondTry.status);
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
    console.log(result.status);
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
    console.log(result.status);
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
    console.log(result.status);
    expect(result.status).toEqual(401);
  });
   it("returns 404 for unregistered email", async () => {

     const bodySignIn = {
       email: "emailnaoregistrado@test.com",
       password: "1234",
     };
     const result = await supertest(app).post("/sign-in").send(bodySignIn);
     console.log(result.status);
     expect(result.status).toEqual(404);
   });



   it("returns a valid session token with status 200 for valid email and password",async ()=>{
    const hash= bcrypt.hashSync('1234',10);
    await connection.query("DELETE FROM sessions");

    await connection.query(`INSERT INTO users (name,email,password)
    VALUES ($1,$2,$3)`,['teste','test@test.com',hash]);

    const body= {
                 email:"test@test.com",
                 password:"1234"
                };

    const beforeSessions=await connection.query(`Select * FROM sessions`);
    expect(beforeSessions.rows[0]).toEqual(undefined);

    const result=await supertest(app).post("/sign-in").send(body);

    const afterSessions= await connection.query(`Select * FROM sessions`);
    expect(afterSessions.rows.length).toEqual(1);
    
    const session=afterSessions.rows[0];
    console.log(session.token)
    expect(result.body.token).toEqual(session.token);
    expect(result.status).toEqual(200)
  });
});
