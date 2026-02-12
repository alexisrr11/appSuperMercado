import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('La variable DATABASE_URL es obligatoria.');
}

export const pool = new Pool({
  connectionString: databaseUrl,
});
