import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import { Sequelize } from 'sequelize';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  logging: false,
});

const [users] = await sequelize.query(
  `SELECT email, password_hash FROM users WHERE email = 'alice@noteapp.com'`
);

if (!users.length) {
  console.log('User not found');
} else {
  const { email, password_hash } = users[0];
  const valid = await bcrypt.compare('Password123!', password_hash);
  console.log('User:', email);
  console.log('Hash prefix:', password_hash?.slice(0, 20));
  console.log('Password123! valid:', valid);
}

await sequelize.close();
