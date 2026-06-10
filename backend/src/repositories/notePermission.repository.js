import { models } from '../config/database.js';
import { toPlain } from '../utils/modelHelper.js';

const { NotePermission, User } = models;

class NotePermissionRepository {
  async create({ noteId, userId, permission, grantedBy }) {
    let perm = await NotePermission.findOne({
      where: { note_id: noteId, user_id: userId },
      paranoid: false,
    });

    if (perm) {
      if (perm.deleted_at) await perm.restore();
      await perm.update({ permission, granted_by: grantedBy });
    } else {
      perm = await NotePermission.create({
        note_id: noteId,
        user_id: userId,
        permission,
        granted_by: grantedBy,
      });
    }
    return toPlain(perm);
  }

  async findByNote(noteId) {
    const permissions = await NotePermission.findAll({
      where: { note_id: noteId },
      include: [{ model: User, as: 'user', attributes: ['name', 'email', 'avatar_url'] }],
    });
    return permissions.map((p) => ({
      ...toPlain(p),
      name: p.user?.name,
      email: p.user?.email,
      avatar_url: p.user?.avatar_url,
    }));
  }

  async remove(noteId, userId) {
    await NotePermission.destroy({ where: { note_id: noteId, user_id: userId } });
  }
}

export default new NotePermissionRepository();
