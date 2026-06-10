import { models } from '../config/database.js';
import { toPlain } from '../utils/modelHelper.js';

const { Tag, NoteTag } = models;

class TagRepository {
  async findByUser(userId, teamId = null) {
    const where = { user_id: userId };
    if (teamId) where.team_id = teamId;

    const tags = await Tag.findAll({ where, order: [['name', 'ASC']] });
    return toPlain(tags);
  }

  async create({ name, color, userId, teamId }) {
    const tag = await Tag.create({
      name: name.toLowerCase(),
      color,
      user_id: userId,
      team_id: teamId,
    });
    return toPlain(tag);
  }

  async assignToNote(noteId, tagId) {
    const [noteTag] = await NoteTag.findOrCreate({
      where: { note_id: noteId, tag_id: tagId },
      defaults: { note_id: noteId, tag_id: tagId },
    });
    return toPlain(noteTag);
  }

  async removeFromNote(noteId, tagId) {
    await NoteTag.destroy({ where: { note_id: noteId, tag_id: tagId } });
  }

  async getNoteTags(noteId) {
    const noteTags = await NoteTag.findAll({
      where: { note_id: noteId },
      include: [{ model: Tag, as: 'tag' }],
    });
    return noteTags.map((nt) => toPlain(nt.tag)).filter(Boolean);
  }
}

export default new TagRepository();
