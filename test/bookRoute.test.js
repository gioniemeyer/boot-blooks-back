import app from '../src/app.js'
import jest from 'jest';
import supertest from 'supertest';
import connection from '../src/database.js'

describe("GET /books/:id", () => {

    afterAll(() => {
        connection.end();
    })

    it("return 200 and an array for correct get", async () => {
        const result = await supertest(app).get("/books/1");

        expect(result.status).toEqual(200);
        expect(result.body).toEqual(
            expect.objectContaining({
                id: expect.any(Number),
                title: expect.any(String),
                sinopse: expect.any(String),
                author: expect.any(String),
                stock: expect.any(Number),
                price: expect.any(Number)
            })
        );
    });

    it("return 404 for id not created yet", async () => {

        const books = await supertest(app).get("/books");
        const size = books.body.length;

        const result = await supertest(app).get(`/books/${size + 1}`);

        expect(result.status).toEqual(404);
    })

    it("return 403 for invalid format Id", async () => {
        const result = await supertest(app).get("/books/invalidId");

        expect(result.status).toEqual(403);
    })
})