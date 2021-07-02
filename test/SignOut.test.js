import app from "../src/app.js";
import jest from "jest";
import supertest from "supertest";
import connection from "../src/database.js";

afterAll(() => {
  connection.end();
});

    describe("DELETE /logout",()=>{
    beforeEach(async()=>{
        await connection.query(`DELETE FROM sessions`);
        await connection.query(`DELETE FROM users`);
    })

    it("returns status 400 for no token sent", async ()=>{
        const result= await supertest(app).delete("/sign-out");
        console.log(result.status);
        expect(result.status).toEqual(400)
    });

    it("returns status 404 for invalid token", async ()=>{
        await connection.query(`INSERT INTO sessions ("userId", token)
        VALUES ($1, $2)
    `, [1, 'token123']);
        const result= await supertest(app).delete("/sign-out").set("Authorization",'tokenErrado');
        console.log(result.status);
        expect(result.status).toEqual(404)
    });

    it("returns status 200 for valid token",async ()=>{
        await connection.query(`INSERT INTO sessions ("userId", token)
        VALUES ($1, $2)
    `, [1, 'token123']);
        const result= await supertest(app).delete("/sign-out").set("Authorization",'token123');
        console.log(result.status);
        expect(result.status).toEqual(200)
    });
});