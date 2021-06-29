import express from 'express';
import cors from 'cors';
import connection from './database.js'

const app = express();

app.use(cors());
app.use(express.json());

app.get("/books", async (req,res) => {
    try {
        const result = await connection.query(`
            SELECT * FROM books
        `);

        res.status(200).send(result.rows);
    } catch(err) {
        res.status(500).send(err);
    }
})

export default app;