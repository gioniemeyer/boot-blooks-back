import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import * as uuid from "uuid";
import joi from "joi";
import connection from './database.js'

const app = express();

app.use(cors());
app.use(express.json());

app.post("/sign-up", async (req, res) => {
    const { name, email, password } = req.body;
    const schema = joi.object({
      name: joi.string().required(),
      email: joi.string().required(),
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

export default app;