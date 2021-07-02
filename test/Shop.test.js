import app from '../src/app.js'
import jest from 'jest';
import supertest from 'supertest';
import connection from '../src/database.js'

describe("POST /conclusion", () => {

    const correctBody = {
        paymentMethod: 'Pix', 
        receiveMethod: 'Pegar na loja'
    };
    const userBody = {
        name: "Test",
        email: "test@test.com",
        password: "1234"
      };
      const userBody2 = {
        name: "Test2",
        email: "test2@test.com",
        password: "1234"
      };

    const bodySignIn = {
        email: "test@test.com",
        password: "1234"
    };    
    const bodySignIn2 = {
        email: "test2@test.com",
        password: "1234"
    };    

    beforeEach(async () => {
        await connection.query("DELETE FROM cart");
        await connection.query("DELETE FROM users");
        await connection.query("DELETE FROM sessions");
        await connection.query("DELETE FROM books");
        await connection.query("DELETE FROM shops");
    });
    
    afterAll(() => connection.end);

    it("returns 400 for missing token", async() => {
        await connection.query(`
            INSERT INTO books (title, sinopse, author, image, price, stock) 
            VALUES ('teste', 'teste', 'teste', 'teste', 6000, 5);        
        `);
        
        const result = await supertest(app).post(`/conclusion`).send(correctBody);
        expect(result.status).toEqual(400);
    });

    it("returns 403 if client tries to buy more items then available", async() => {
        await connection.query(`
            INSERT INTO books (title, sinopse, author, image, price, stock) 
            VALUES ('teste', 'teste', 'teste', 'teste', 6000, 1);        
        `);

        await supertest(app).post("/sign-up").send(userBody);
        await supertest(app).post("/sign-up").send(userBody2);

        const user = await supertest(app).post("/sign-in").send(bodySignIn);
        const user2 = await supertest(app).post("/sign-in").send(bodySignIn2);

        const token = user.body.token;
        const token2 = user2.body.token;

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
        };
        const cartBody2 = {
            token: token2,
            bookId: bookId,
            quantity: 1
        }

        await supertest(app).post("/cart").send(cartBody);
        await supertest(app).post("/cart").send(cartBody2);

        await supertest(app).post('/conclusion').send(correctBody).set('authorization', `Bearer ${token}`);
        const result = await supertest(app).post('/conclusion').send(correctBody).set('authorization', `Bearer ${token2}`)
        expect(result.status).toEqual(403);
    });

    it("returns 201 for concluded shopping", async() => {
        await connection.query(`
            INSERT INTO books (title, sinopse, author, image, price, stock) 
            VALUES ('teste', 'teste', 'teste', 'teste', 6000, 1);        
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

        await supertest(app).post("/cart").send(cartBody);

        const result = await supertest(app).post('/conclusion').send(correctBody).set('authorization',`Bearer ${token}`);
        expect(result.status).toEqual(201);
    })

})