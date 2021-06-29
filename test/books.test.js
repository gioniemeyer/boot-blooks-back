import app from '../src/app.js'
import jest from 'jest';
import supertest from 'supertest';
import connection from '../src/database.js'
import { string } from 'joi';

describe("GET /books", () => {

    afterAll(() => {
        connection.end();
    })

    it("return 200 and an array for correct get", async () => {
        const result = await supertest(app).get("/books");

        expect(result.status).toEqual(200);
        expect(result.body).toEqual(
            expect.any(Array)
        );
    })

    it("return array of books for correct get", async () => {
        const result = await supertest(app).get("/books");

        expect(result.body[0]).toEqual(
            expect.objectContaining({
                id: expect.any(Number),
                title: expect.any(String),
                sinopse: expect.any(String),
                author: expect.any(String),
                stock: expect.any(Number),
                price: expect.any(Number)
            })
        );
    })

})