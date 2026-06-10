import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const client = new pg.Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

await client.connect();

const tables = await client.query(`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' ORDER BY table_name
`);
console.log('Tables:', tables.rows.map((r) => r.table_name).join(', ') || '(none)');

const meta = await client.query(`SELECT name FROM "SequelizeMeta" ORDER BY name`).catch(() => ({ rows: [] }));
console.log('SequelizeMeta:', meta.rows.map((r) => r.name).join(', ') || '(none)');

await client.end();
