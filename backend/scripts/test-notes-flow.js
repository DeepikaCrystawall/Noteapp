import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const login = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'alice@noteapp.com', password: 'Password123!' }),
});
const { data: auth } = await login.json();
const token = auth.accessToken;
const userId = auth.user.id;
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

const create = await fetch('http://localhost:3001/api/notes', {
  method: 'POST',
  headers,
  body: JSON.stringify({ title: 'Test Note ' + Date.now(), content: 'hello' }),
});
const created = await create.json();
console.log('Create status:', create.status, created.message);

const list = await fetch('http://localhost:3001/api/notes?sort=updated&page=1&limit=20', { headers });
const listed = await list.json();
console.log('List status:', list.status);
console.log('Total:', listed.pagination?.total);
console.log('Notes:', listed.data?.map((n) => n.title));

const { default: redis } = await import('../src/config/redis.js');
await redis.connect();
const keys = await redis.keys(`notes:${userId}:*`);
console.log('Cached keys:', keys.length);
await redis.quit();
