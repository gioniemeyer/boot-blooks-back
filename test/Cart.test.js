import app from '../src/app.js'
import jest from 'jest';
import supertest from 'supertest';
import connection from '../src/database.js'
import { string } from 'joi';

beforeEach(async () => {
    await connection.query("DELETE FROM cart");
  });

  beforeEach(async () => {
    await connection.query("DELETE FROM users");
  });

  beforeEach(async () => {
    await connection.query("DELETE FROM sessions");
  });

  beforeEach(async () => {
    await connection.query("DELETE FROM books");
  });

  describe("POST /cart", () => {

    afterAll(() => {
        connection.end();
    })

    it("return 403 for an order higher than stock allows", async () => {
        
        await connection.query(`
            INSERT INTO books (title, sinopse, author, image, price, stock) 
            VALUES ('teste', 'teste', 'teste', 'teste', 6000, 0);        
        `);

        const userBody = {
            name: "Test",
            email: "test@test.com",
            password: "1234"
          };

        const bodySignIn = {
            email: "test@test.com",
            password: "1234"
        };
        
        await supertest(app).post("/sign-up").send(userBody);
        const user = await supertest(app).post("/sign-in").send(bodySignIn);
        
        const token = user.body.token;

        const bookStock = await connection.query(`
            SELECT *
            FROM books
            WHERE title = 'teste'
        `)

        const bookId = bookStock.rows[0].id;

        const cartBody = {
            token,
            bookId: bookId,
            quantity: 1
        }

        const result = await supertest(app).post("/cart").send(cartBody);

        expect(result.status).toEqual(403);
    })

    it("return 201 for correct cart addiction", async () => {
        await connection.query(`
            INSERT INTO books (title, sinopse, author, image, price, stock) 
            VALUES ('teste', 'teste', 'teste', 'teste', 6000, 5);        
        `);

        const userBody = {
            name: "Test",
            email: "test@test.com",
            password: "1234"
          };

        const bodySignIn = {
            email: "test@test.com",
            password: "1234"
        };
        
        await supertest(app).post("/sign-up").send(userBody);
        const user = await supertest(app).post("/sign-in").send(bodySignIn);
        
        const token = user.body.token;

        const bookStock = await connection.query(`
            SELECT *
            FROM books
            WHERE title = 'teste'
        `)

        const bookId = bookStock.rows[0].id;

        const cartBody = {
            token,
            bookId: bookId,
            quantity: 1
        }

        const result = await supertest(app).post("/cart").send(cartBody);

        expect(result.status).toEqual(201);
    });

    it("return 400 for incorrect body", async () => {
        
        const cartBody = {
            token: "dsfgbksjfs",
            quantity: 1
        }

        const result = await supertest(app).post("/cart").send(cartBody);

        expect(result.status).toEqual(400);
    })
})

// describe("GET /cart", () => {

//     afterAll(() => {
//         connection.end();
//     })

//     it("return 200 and an array for correct get", async () => {
//         const result = await supertest(app).get("/books");

//         expect(result.status).toEqual(200);
//         expect(result.body).toEqual(
//             expect.any(Array)
//         );
//     })
// })

// describe("POST /update-cart", () => {

//     afterAll(() => {
//         connection.end();
//     })

//     it("return 200 and an array for correct get", async () => {
//         const result = await supertest(app).get("/books");

//         expect(result.status).toEqual(200);
//         expect(result.body).toEqual(
//             expect.any(Array)
//         );
//     })
// });

// describe("POST /delete-book", () => {

//     afterAll(() => {
//         connection.end();
//     })

//     it("return 200 and an array for correct get", async () => {
//         const result = await supertest(app).get("/books");

//         expect(result.status).toEqual(200);
//         expect(result.body).toEqual(
//             expect.any(Array)
//         );
//     })
// })