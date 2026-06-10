import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const { default: noteRepository } = await import('../src/repositories/note.repository.js');

const userId = 'a0000000-0000-4000-8000-000000000001';

try {
  const result = await noteRepository.search(userId, {
    q: '',
    sort: 'updated',
    page: 1,
    limit: 20,
  });
  console.log('Success:', result.total, 'notes');
  console.log(result.notes.map((n) => n.title));
} catch (e) {
  console.error('Error:', e.message);
  console.error(e.parent?.detail || e.original?.message);
}

process.exit(0);
