import pg from 'pg';

const databaseConfig = {
    host: "localhost",
    port: 5432,
    password: "1234",
    user: "postgres",
	database: process.env.NODE_ENV === "test" ? "boot-blooks-teste" : "boot-blooks"
}

const {Pool} = pg;

const connection = new Pool(databaseConfig);

export default connection;