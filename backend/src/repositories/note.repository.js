import { Op, QueryTypes } from 'sequelize';
import sequelize, { models } from '../config/database.js';
import { toPlain } from '../utils/modelHelper.js';

const { Note, User, NotePermission, TeamMember } = models;

class NoteRepository {
  async findById(id) {
    const note = await Note.findOne({
      where: { id },
      include: [{ model: User, as: 'owner', attributes: ['name', 'avatar_url'] }],
    });
    if (!note) return null;
    const plain = toPlain(note);
    plain.owner_name = note.owner?.name;
    plain.owner_avatar = note.owner?.avatar_url;
    return plain;
  }

  async create({ title, content, ownerId, teamId }) {
    const note = await Note.create({
      title,
      content,
      owner_id: ownerId,
      team_id: teamId,
    });
    return toPlain(note);
  }

  async update(id, data) {
    const note = await Note.findByPk(id);
    if (!note) return null;
    await note.update(data);
    return toPlain(note);
  }

  async softDelete(id) {
    await Note.destroy({ where: { id } });
  }

  async archive(id) {
    const note = await Note.findByPk(id);
    if (!note) return null;
    await note.update({ is_archived: true });
    return toPlain(note);
  }

  async restore(id) {
    const note = await Note.findByPk(id, { paranoid: false });
    if (!note) return null;
    await note.restore();
    await note.update({ is_archived: false });
    return toPlain(note);
  }

  async togglePin(id, isPinned) {
    const note = await Note.findByPk(id);
    if (!note) return null;
    await note.update({ is_pinned: isPinned });
    return toPlain(note);
  }

  async toggleFavorite(id, isFavorite) {
    const note = await Note.findByPk(id);
    if (!note) return null;
    await note.update({ is_favorite: isFavorite });
    return toPlain(note);
  }

  async duplicate(id, ownerId) {
    const original = await this.findById(id);
    if (!original) return null;

    const note = await Note.create({
      title: `${original.title} (Copy)`,
      content: original.content,
      owner_id: ownerId,
      team_id: original.team_id,
    });
    return toPlain(note);
  }

  async search(userId, { q, archived, shared, owned, favorites, sort, page, limit, teamId, tagId }) {
    const conditions = ['n.deleted_at IS NULL'];
    const replacements = { userId, limit, offset: (page - 1) * limit };

    conditions.push(`(
      n.owner_id = :userId
      OR n.id IN (SELECT note_id FROM note_permissions WHERE user_id = :userId AND deleted_at IS NULL)
      OR n.team_id IN (SELECT team_id FROM team_members WHERE user_id = :userId AND deleted_at IS NULL)
    )`);

    if (q) {
      conditions.push(`(
        n.title ILIKE :q
        OR n.content ILIKE :q
        OR n.id IN (
          SELECT nt.note_id FROM note_tags nt
          JOIN tags t ON t.id = nt.tag_id
          WHERE t.name ILIKE :q
        )
      )`);
      replacements.q = `%${q}%`;
    }

    if (archived !== undefined) {
      conditions.push('n.is_archived = :archived');
      replacements.archived = archived;
    }

    if (favorites) {
      conditions.push('n.is_favorite = TRUE');
    }

    if (owned) {
      conditions.push('n.owner_id = :userId');
    }

    if (shared) {
      conditions.push('n.id IN (SELECT note_id FROM note_permissions WHERE user_id != n.owner_id AND deleted_at IS NULL)');
    }

    if (teamId) {
      conditions.push('n.team_id = :teamId');
      replacements.teamId = teamId;
    }

    if (tagId) {
      conditions.push('n.id IN (SELECT note_id FROM note_tags WHERE tag_id = :tagId)');
      replacements.tagId = tagId;
    }

    const sortMap = {
      latest: 'n.created_at DESC',
      oldest: 'n.created_at ASC',
      title: 'n.title ASC',
      updated: 'n.updated_at DESC',
    };
    const orderBy = sortMap[sort] || 'n.updated_at DESC';
    const where = conditions.join(' AND ');

    const [countResult, notes] = await Promise.all([
      sequelize.query(`SELECT COUNT(DISTINCT n.id) as count FROM notes n WHERE ${where}`, {
        replacements,
        type: QueryTypes.SELECT,
      }),
      sequelize.query(`
        SELECT n.*, u.name as owner_name,
          COALESCE(
            (SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'color', t.color))
             FROM note_tags nt JOIN tags t ON t.id = nt.tag_id WHERE nt.note_id = n.id),
            '[]'::json
          ) as tags
        FROM notes n
        JOIN users u ON u.id = n.owner_id
        WHERE ${where}
        ORDER BY n.is_pinned DESC, ${orderBy}
        LIMIT :limit OFFSET :offset
      `, { replacements, type: QueryTypes.SELECT }),
    ]);

    return {
      notes,
      total: parseInt(countResult[0].count, 10),
      page,
      limit,
    };
  }

  async getUserPermission(noteId, userId) {
    const note = await Note.findByPk(noteId);
    if (!note) return null;
    if (note.owner_id === userId) return 'owner';

    const perm = await NotePermission.findOne({
      where: { note_id: noteId, user_id: userId },
    });
    if (perm) return perm.permission;

    if (note.team_id) {
      const member = await TeamMember.findOne({
        where: { team_id: note.team_id, user_id: userId },
      });
      if (member) {
        const roleMap = { owner: 'owner', admin: 'write', editor: 'write', viewer: 'read' };
        return roleMap[member.role] || 'read';
      }
    }

    return null;
  }
}

export default new NoteRepository();
