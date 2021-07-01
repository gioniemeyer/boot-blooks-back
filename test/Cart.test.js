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

  describe("POST /cart", () => {

    it("return 403 for an order higher than stock allows", async () => {
        
        await connection.query(`
            INSERT INTO books (title, sinopse, author, image, price, stock) 
            VALUES ('teste', 'teste', 'teste', 'teste', 6000, 0);        
        `);
        
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

describe("GET /cart", () => {

    it("return 400 for request without token", async () => {
        const result = await supertest(app).get("/cart");
        expect(result.status).toEqual(400);
    })

    it("return 200 for correct request", async () => {
                
        await supertest(app).post("/sign-up").send(userBody);
        const user = await supertest(app).post("/sign-in").send(bodySignIn);
        
        const token = user.body.token;

        const result = await supertest(app).get("/cart").set('authorization',`Bearer ${token}`);

        expect(result.status).toEqual(200);
    })
})

describe("POST /update-cart", () => {

    it("return 400 for wrong body", async () => {
        const cartBody = {
            bookId: 1,
            quantity: 1
        }

        const result = await supertest(app).post("/update-cart").send(cartBody);

        expect(result.status).toEqual(400);
    });

    it("return 403 for an order higher than stock allows", async () => {
        await supertest(app).post("/sign-up").send(userBody);
        const user = await supertest(app).post("/sign-in").send(bodySignIn);
        
        const token = user.body.token;

        await connection.query(`
            INSERT INTO books (title, sinopse, author, image, price, stock) 
            VALUES ('teste', 'teste', 'teste', 'teste', 6000, 1);        
        `);
        
        const bookStock = await connection.query(`
            SELECT *
            FROM books
            WHERE title = 'teste'
        `);

        const bookId = bookStock.rows[0].id;

        const cartBody = {
            token,
            bookId: bookId,
            quantity: 1
        }

        const body = {
            token: token,
            bookId: bookId,
            quantity: 1
        }

        await supertest(app).post("/cart").send(cartBody);

        const result = await supertest(app).post("/update-cart").send(body);
        expect(result.status).toEqual(403);
    })

    it("return 200 for correct request", async () => {
        await supertest(app).post("/sign-up").send(userBody);
        const user = await supertest(app).post("/sign-in").send(bodySignIn);
        
        const token = user.body.token;

        await connection.query(`
            INSERT INTO books (title, sinopse, author, image, price, stock) 
            VALUES ('teste', 'teste', 'teste', 'teste', 6000, 3);        
        `);
        
        const bookStock = await connection.query(`
            SELECT *
            FROM books
            WHERE title = 'teste'
        `);

        const bookId = bookStock.rows[0].id;

        const cartBody = {
            token,
            bookId: bookId,
            quantity: 1
        }

        const body = {
            token: token,
            bookId: bookId,
            quantity: 1
        }

        await supertest(app).post("/cart").send(cartBody);

        const result = await supertest(app).post("/update-cart").send(body);
        console.log(result);
        expect(result.status).toEqual(200);
    })
});

describe("POST /delete-book", () => {

    it("return 200 and an array for correct get", async () => {
        await supertest(app).post("/sign-up").send(userBody);
        const user = await supertest(app).post("/sign-in").send(bodySignIn);
        const token = user.body.token;
        const body = {bookId: 1};

        const result = await supertest(app).post("/delete-book").send(body).set('authorization',`Bearer ${token}`);

        expect(result.status).toEqual(200);
     })

     it("return 400 for request without authorization", async () => {
        const body = {bookId: 1};
        const result = await supertest(app).post("/delete-book").send(body);

        expect(result.status).toEqual(400);
     })

     it("return 400 for request with wrong body", async () => {
        await supertest(app).post("/sign-up").send(userBody);
        const user = await supertest(app).post("/sign-in").send(bodySignIn);
        const token = user.body.token;

        const body = {};
        const result = await supertest(app).post("/delete-book").send(body).set('authorization',`Bearer ${token}`);

        expect(result.status).toEqual(400);
     })
})