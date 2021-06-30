import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import * as uuid from "uuid";
import joi from "joi";
import connection from "./database.js";
import { SchemaSignIn } from "./schemas.js/SchemaSignIn.js";
import { SchemaSignUp } from "./schemas.js/SchemaSignUp.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/sign-up", async (req, res) => {
  const { name, email, password } = req.body;
  const { error } = SchemaSignUp.validate(req.body);
  const passwordHash = bcrypt.hashSync(password, 10);
  if (error) return res.sendStatus(400);
  try {
    const userExists = await connection.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (!userExists.rows[0]) {
      const user = await connection.query(
        `INSERT INTO users (name , email, password) VALUES ($1 ,$2, $3)`,
        [name, email, `${passwordHash}`]
      );
      console.log(user.rows);
      res.sendStatus(201);
    } else {
      res.sendStatus(409);
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
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
    if (
      !userResult.rows[0] ||
      !bcrypt.compareSync(password, userResult.rows[0].password)
    ) {
      return res.sendStatus(401);
    }else{
    const token = uuid.v4();
    const userId = userResult.rows[0].id;
    const name = userResult.rows[0].name;
    await connection.query(
      `INSERT INTO "sessions" ("userId", token) VALUES ($1 ,$2)`,
      [userId, token]
    );
     return res.send({ name, token });
  }
  } catch (e) {
    console.error(e);
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

export default app;
