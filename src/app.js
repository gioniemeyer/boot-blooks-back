import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import connection from "./database.js";
import { SchemaSignIn } from "./schemas/SchemaSignIn.js";
import { SchemaSignUp } from "./schemas/SchemaSignUp.js";
import { SchemaCart } from "./schemas/SchemaCart.js";
import loadDotEnv from "./setup.js";


const app = express();
app.use(cors());
app.use(express.json());

app.get("/books/:id", async (req, res) => {
  try {
    let { id } = req.params;

    if (!parseInt(id)) return res.sendStatus(403);

    const response = await connection.query(
      `
        SELECT * FROM books WHERE id = $1
      `,
      [id]
    );

    if (response?.rows.length === 0) return res.sendStatus(404);

    return res.status(200).send(response.rows[0]);
  } catch (err) {
    return res.status(500).send(err);
  }
});

app.post("/sign-up", async (req, res) => {
  const { name, email, password } = req.body;
  const { error } = SchemaSignUp.validate(req.body);

  if (error) return res.sendStatus(400);
  const passwordHash = bcrypt.hashSync(password, 10);
  try {
    const userExists = await connection.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (!userExists.rows[0]) {
      const user = await connection.query(
        `INSERT INTO users (name , email, password) 
          VALUES ($1 ,$2, $3)`,
          [name, email, `${passwordHash}`]
        );
        return res.sendStatus(201);
      } else {
        return res.sendStatus(409);
      }
    } catch (e) {
      return res.sendStatus(500);
    }
});

app.post("/sign-in", async (req, res) => {
  const { email, password } = req.body;
  const { error } = SchemaSignIn.validate(req.body);
  if (error) return res.sendStatus(400);

  try {
    const userResult = await connection.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (!userResult.rows[0]) {
      return res.sendStatus(404);
    } else if (!bcrypt.compareSync(password, userResult.rows[0].password)) {
      return res.sendStatus(401);
    } else {
      const token = uuid();
      const userId = userResult.rows[0].id;
      const name = userResult.rows[0].name;
      await connection.query(
        `INSERT INTO "sessions" ("userId", token) VALUES ($1 ,$2)`,
        [userId, token]
      );
      return res.send({ name, token });
    }
  } catch (e) {
    res.sendStatus(500);
  }
});

app.get("/books", async (req, res) => {
  try {
    const result = await connection.query(`
            SELECT * FROM books
        `);

    res.status(200).send(result.rows);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get("/books", async (req, res) => {
  try {
    const result = await connection.query(`
          SELECT * FROM books
      `);

    return res.status(200).send(result.rows);
  } catch (err) {
    return res.status(500).send(err);
  }
});

app.post("/sign-out", async (req, res) => {
  const authorization = req.headers["authorization"];
  const token = authorization?.replace("Bearer ", "");
  if (!token) return res.sendStatus(401);
  try {
    await connection.query(
      `DELETE FROM "sessions" 
         WHERE token = $1`,
      [token]
    );
    return res.sendStatus(204);
  } catch (e) {
    console.log(e);
    return res.sendStatus(500);
  }
});
app.post("/cart", async (req, res) => {
  try {
    const { token, bookId, quantity } = req.body;

    const { error } = SchemaCart.validate(req.body);
    if (error) return res.sendStatus(400);

    let session = await connection.query(
      `
      SELECT * from sessions WHERE token = $1
    `,
      [token]
    );

    session = session.rows[0];
    const userId = session.userId;

    const check = await connection.query(`
      SELECT *
      FROM cart
      WHERE "userId" = ${userId} AND "bookId" = ${bookId}
    `);

    let bookStock = await connection.query(`
      SELECT books.stock
      FROM books
      WHERE id = ${bookId}
    `);

    bookStock = bookStock.rows[0].stock;

    if (check.rows.length > 0) {
      const oldQuantity = check.rows[0].quantity;
      if (oldQuantity + quantity > bookStock) return res.sendStatus(403);

      await connection.query(`
        UPDATE cart 
        SET quantity = ${oldQuantity + quantity} 
        WHERE "userId" = ${userId} AND "bookId"=${bookId}
      `);
    } else {
      if (quantity > bookStock) return res.sendStatus(403);

      await connection.query(
        `
        INSERT INTO cart ("userId", "bookId", quantity)
        VALUES ($1, $2, $3)
      `,
        [userId, bookId, quantity]
      );
    }

    return res.sendStatus(201);
  } catch(err) {
    return res.status(500).send(err);
  }
});

app.get("/cart", async (req, res) => {
  try {
    const authorization = req.headers["authorization"];
    const token = authorization?.replace("Bearer ", "");

    if (!token) return res.sendStatus(400);

    let session = await connection.query(
      `
      SELECT * from sessions WHERE token = $1
    `,
      [token]
    );

    session = session.rows[0];

    const userId = session?.userId;

    const response = await connection.query(
      `
      SELECT books.*, cart.quantity, cart."userId" 
      FROM cart
      JOIN books
      ON books.id = cart."bookId" 
      WHERE cart."userId" = $1
    `,
      [userId]
    );

    return res.status(200).send(response.rows);
  } catch(err) {
     return res.status(500).send(err);
  }
});

app.post("/update-cart", async (req, res) => {
  try {
    const { token, quantity, bookId } = req.body;

    if (!token || !quantity || !parseInt(bookId)) return res.sendStatus(400);

    let session = await connection.query(
      `
      SELECT * from sessions WHERE token = $1
    `,
      [token]
    );

    session = session.rows[0];

    const userId = session?.userId;

    let bookStock = await connection.query(`
      SELECT books.stock
      FROM books
      WHERE id = ${bookId}
    `);

    bookStock = bookStock.rows[0].stock;

    const book = await connection.query(`
      SELECT * FROM cart WHERE "userId" = ${userId} AND "bookId" = ${bookId}
    `);

    const oldQuantity = book.rows[0].quantity;

    if (oldQuantity === 1 && quantity === -1) {
      await connection.query(`
      DELETE from cart WHERE "userId" = ${userId} AND "bookId" = ${bookId}`);
    } else {
      if (oldQuantity + quantity > bookStock) return res.sendStatus(403);
      await connection.query(`
        UPDATE cart SET quantity = ${oldQuantity + quantity}
        WHERE "userId" = ${userId} AND "bookId" = ${bookId}
      `);
    }

    const response = await connection.query(
      `
      SELECT books.*, cart.quantity, cart."userId" 
      FROM cart
      JOIN books
      ON books.id = cart."bookId" 
      WHERE cart."userId" = $1
    `,
      [userId]
    );

    return res.status(200).send(response.rows);
  } catch (err) {
    return res.status(500).send(err);
  }
});

app.post("/delete-book", async (req, res) => {
  try {
    const authorization = req.headers["authorization"];
    const token = authorization?.replace("Bearer ", "");
    const { bookId } = req.body;

    if (!token || !bookId) return res.sendStatus(400);

    let session = await connection.query(
      `
      SELECT * from sessions WHERE token = $1
    `,
      [token]
    );

    session = session.rows[0];

    const userId = session?.userId;

    await connection.query(`
      DELETE from cart WHERE "userId" = ${userId} AND "bookId" = ${bookId}`);

    const response = await connection.query(
      `
      SELECT books.*, cart.quantity, cart."userId" 
      FROM cart
      JOIN books
      ON books.id = cart."bookId" 
      WHERE cart."userId" = $1
    `,
      [userId]
    );
    return res.status(200).send(response.rows);
  } catch (err) {
    return res.status(500).send(err);
  }
});


app.post('/conclusion', async (req, res) => {
  try {
    const authorization = req.headers['authorization'];
    const token = authorization?.replace('Bearer ', "");
    const body = req.body;

    if(!token) return res.sendStatus(400);

    let session = await connection.query(`
      SELECT * from sessions WHERE token = $1
    `,[token]);

    session = session.rows[0];
    const userId = session?.userId;
   
    let cart = await connection.query(`
      SELECT cart.*, books.price, books.stock
      FROM cart
      JOIN books
      ON books.id = cart."bookId"
      WHERE cart."userId" = $1   
    `, [userId])

    cart = cart.rows;
    
    for(let i = 0; i < cart.length; i++) {
      if(cart[i].stock < cart[i].quantity) return res.send(403);
    }

    for(let i = 0; i < cart.length; i++) {
      await connection.query(`
        INSERT INTO shops ("userId", "bookId", quantity, cost, "paymentMethod", "receiveMethod")
        VALUES ($1, $2, $3, $4, $5, $6)`,[userId, cart[i].bookId, cart[i].quantity, cart[i].quantity * cart[i].price, body.paymentMethod, body.receiveMethod])    
      
      const newStock = cart[i].stock - cart[i].quantity
      await connection.query(`
        UPDATE books
        SET stock = ${newStock}
        WHERE id = ${cart[i].bookId}
      `)
    }

    await connection.query(`
      DELETE FROM cart WHERE "userId" = ${userId} 
    `)

    res.sendStatus(201);

  } catch(err) {
    return res.status(500).send(err);
  }
});

app.get('/myrequests', async (req, res) => {
  try {
    const authorization = req.headers['authorization'];
    const token = authorization?.replace('Bearer ', "");
    if(!token) return res.sendStatus(400);

    let session = await connection.query(`
    SELECT * from sessions WHERE token = $1
  `,[token]);

    session = session.rows[0];
    const userId = session?.userId;
    
    const response = await connection.query(`
      SELECT shops.*, books.* 
      FROM shops
      JOIN books
      ON books.id = shops."bookId" 
      WHERE shops."userId" = $1
    `, [userId])
    return res.status(200).send(response.rows);
  } catch(err) {
    return res.status(500).send(err)
  }
  });



export default app;
