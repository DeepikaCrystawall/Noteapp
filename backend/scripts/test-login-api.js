import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const { default: userRepository } = await import('../src/repositories/user.repository.js');

const user = await userRepository.findByEmail('alice@noteapp.com');
console.log('Found user:', !!user);
console.log('Has password_hash:', !!user?.password_hash);
console.log('password_hash type:', typeof user?.password_hash);

if (user?.password_hash) {
  const valid = await bcrypt.compare('Password123!', user.password_hash);
  console.log('bcrypt compare:', valid);
}

try {
  const res = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alice@noteapp.com', password: 'Password123!' }),
  });
  const body = await res.json();
  console.log('API status:', res.status);
  console.log('API response:', JSON.stringify(body, null, 2));
} catch (e) {
  console.log('API error (server may be down):', e.message);
}

process.exit(0);
