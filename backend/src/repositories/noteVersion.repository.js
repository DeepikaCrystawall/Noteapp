import { models } from '../config/database.js';
import { toPlain } from '../utils/modelHelper.js';

const { NoteVersion, User } = models;

class NoteVersionRepository {
  async create({ noteId, versionNumber, title, content, createdBy }) {
    const version = await NoteVersion.create({
      note_id: noteId,
      version_number: versionNumber,
      title,
      content,
      created_by: createdBy,
    });
    return toPlain(version);
  }

  async getNextVersionNumber(noteId) {
    const max = await NoteVersion.max('version_number', { where: { note_id: noteId } });
    return (max || 0) + 1;
  }

  async findByNoteId(noteId, { page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const { rows, count } = await NoteVersion.findAndCountAll({
      where: { note_id: noteId },
      include: [{ model: User, as: 'author', attributes: ['name'] }],
      order: [['version_number', 'DESC']],
      limit,
      offset,
    });
    const versions = rows.map((v) => {
      const plain = toPlain(v);
      plain.created_by_name = v.author?.name;
      return plain;
    });
    return { versions, total: count, page, limit };
  }

  async findByVersion(noteId, versionNumber) {
    const version = await NoteVersion.findOne({
      where: { note_id: noteId, version_number: versionNumber },
    });
    return toPlain(version);
  }
}

export default new NoteVersionRepository();
