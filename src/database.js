import pg from 'pg';
import loadDotEnv from './setup.js'

const databaseConfig = {
    connectionString: process.env.DATABASE_URL,
      ssl: {
          rejectUnauthorized: false
      }
}
const {Pool} = pg; 
const connection = new Pool(databaseConfig);

export default connection;