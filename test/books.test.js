import app from '../src/app.js'
import jest from 'jest';
import supertest from 'supertest';
import connection from '../src/database.js'
import { string } from 'joi';

describe("GET /books", () => {

    afterAll(() => {
        connection.end();
    })

    it("return 200 and an array of books for correct get", async () => {
        const result = await supertest(app).get("/books");

        expect(result.status).toEqual(200);
        expect(result.body).toEqual(
            expect.any(Array)
        );
    })

})