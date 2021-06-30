import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import {v4 as uuid} from "uuid";
import joi from "joi";
import connection from './database.js'
import loadDotEnv from './setup.js'

const app = express();

app.use(cors());
app.use(express.json());

app.get("/books/:id", async (req,res) => {
  try {
    let {id} = req.params;

    if(!parseInt(id)) return res.sendStatus(403)

    const response = await connection.query(`
        SELECT * FROM books WHERE id = $1
      `, [id]);

    if(response?.rows.length === 0) return res.sendStatus(404);

    return res.status(200).send(response.rows[0]);
  } catch(err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

app.post("/sign-up", async (req, res) => {
    const { name, email, password } = req.body;
    const schema = joi.object({
      name: joi.string().required(),
      email: joi.string().email().required(),
      password: joi.string().required(),
    });
  
    const isValid = schema.validate(req.body);
    if (isValid.error) return res.sendStatus(404);
  
    const passwordHash = bcrypt.hashSync(password, 10);
  
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
        return res.sendStatus(201);
      } else {
        return res.sendStatus(409);
      }
    } catch (e) {
      console.error(e);
      return res.sendStatus(500);
    }
  });

app.get("/books", async (req,res) => {
    try {
      const result = await connection.query(`
          SELECT * FROM books
      `);

      return res.status(200).send(result.rows);
    } catch(err) {
      return res.status(500).send(err);
    }
});


export default app;