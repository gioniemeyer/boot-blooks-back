import app from '../src/app.js'
import jest from 'jest';
import supertest from 'supertest';
import connection from '../src/database.js'
import { string } from 'joi';

beforeEach(async () => {
    await connection.query("DELETE FROM cart");
    await connection.query("DELETE FROM users");
    await connection.query("DELETE FROM sessions");
    await connection.query("DELETE FROM books");
});

afterAll(() => {
    connection.end();
});

const userBody = {
    name: "Test",
    email: "test@test.com",
    password: "1234"
  };

const bodySignIn = {
    email: "test@test.com",
    password: "1234"
};

describe("GET /myrequests", () => {

    it("return 200 and an array for correct get", async () => {
        await supertest(app).post("/sign-up").send(userBody);
        const user = await supertest(app).post("/sign-in").send(bodySignIn);
        const token = user.body.token;

        const result = await supertest(app).get("/myrequests").set('authorization',`Bearer ${token}`);

        expect(result.status).toEqual(200);
        expect(result.body).toEqual(
            expect.any(Array))
     })

     it("return 400 for request without authorization", async () => {

        const result = await supertest(app).get("/myrequests");

        expect(result.status).toEqual(400);
     })

})