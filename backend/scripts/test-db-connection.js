import pg from 'pg';

const attempts = [
  { port: 5432, user: 'postgres', password: 'password', database: 'postgres' },
  { port: 5432, user: 'postgres', password: 'password', database: 'noteapp_db' },
  { port: 5433, user: 'noteapp', password: 'noteapp_secret', database: 'noteapp_db' },
  { port: 5433, user: 'postgres', password: 'password', database: 'postgres' },
];

for (const cfg of attempts) {
  const client = new pg.Client({ host: 'localhost', ...cfg });
  const label = `${cfg.user}@localhost:${cfg.port}/${cfg.database}`;
  try {
    await client.connect();
    await client.query('SELECT 1');
    console.log(`OK  ${label}`);
  } catch (err) {
    console.log(`FAIL ${label} -> ${err.message}`);
  } finally {
    try { await client.end(); } catch { /* ignore */ }
  }
}
