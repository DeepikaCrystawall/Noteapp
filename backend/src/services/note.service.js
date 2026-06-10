import noteRepository from '../repositories/note.repository.js';
import userRepository from '../repositories/user.repository.js';
import noteVersionRepository from '../repositories/noteVersion.repository.js';
import notePermissionRepository from '../repositories/notePermission.repository.js';
import tagRepository from '../repositories/tag.repository.js';
import activityLogRepository from '../repositories/activityLog.repository.js';
import notificationService from './notification.service.js';
import { cacheAside, cacheDelete, cacheDeletePattern, CACHE_KEYS } from '../utils/cache.js';
import { hasNotePermission } from '../utils/permissions.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { redisPub } from '../config/redis.js';
import { PUBSUB_CHANNELS } from '../events/channels.js';

class NoteService {
  async create(userId, data) {
    const note = await noteRepository.create({
      title: data.title,
      content: data.content,
      ownerId: userId,
      teamId: data.teamId,
    });

    await activityLogRepository.create({
      userId,
      action: 'note_created',
      entityType: 'note',
      entityId: note.id,
      metadata: { title: note.title },
    });

    await this._invalidateCache(userId, note.id);
    await this._publishEvent('note:create', note);

    return note;
  }

  async getById(noteId, userId) {
    return cacheAside(CACHE_KEYS.note(noteId, userId), async () => {
      const permission = await noteRepository.getUserPermission(noteId, userId);
      if (!permission) throw new ForbiddenError('No access to this note');

      const note = await noteRepository.findById(noteId);
      if (!note) throw new NotFoundError('Note not found');

      const tags = await tagRepository.getNoteTags(noteId);
      const permissions = await notePermissionRepository.findByNote(noteId);
      return { ...note, tags, permissions, userPermission: permission };
    });
  }

  async list(userId, query) {
    return cacheAside(CACHE_KEYS.notes(userId, query), () => noteRepository.search(userId, query));
  }

  async update(noteId, userId, data, { createVersion = true } = {}) {
    await this._requirePermission(noteId, userId, 'write');

    const existing = await noteRepository.findById(noteId);
    if (!existing) throw new NotFoundError('Note not found');

    if (createVersion) {
      const versionNumber = await noteVersionRepository.getNextVersionNumber(noteId);
      await noteVersionRepository.create({
        noteId,
        versionNumber,
        title: existing.title,
        content: existing.content,
        createdBy: userId,
      });
    }

    const note = await noteRepository.update(noteId, data);

    await activityLogRepository.create({
      userId,
      action: 'note_updated',
      entityType: 'note',
      entityId: noteId,
      metadata: { fields: Object.keys(data) },
    });

    await this._notifyCollaborators(noteId, userId, 'note_updated', 'Note Updated', `A note you collaborate on was updated`);

    await this._invalidateCache(userId, noteId);
    await this._publishEvent('note:update', note);

    return note;
  }

  async delete(noteId, userId) {
    await this._requirePermission(noteId, userId, 'owner');
    await noteRepository.softDelete(noteId);

    await activityLogRepository.create({
      userId,
      action: 'note_deleted',
      entityType: 'note',
      entityId: noteId,
      metadata: {},
    });

    await this._invalidateCache(userId, noteId);
    await this._publishEvent('note:delete', { id: noteId });
  }

  async archive(noteId, userId) {
    await this._requirePermission(noteId, userId, 'write');
    const note = await noteRepository.archive(noteId);
    if (!note) throw new NotFoundError('Note not found');

    await this._invalidateCache(userId, noteId);
    await this._publishEvent('note:archive', note);
    return note;
  }

  async restore(noteId, userId) {
    await this._requirePermission(noteId, userId, 'write');
    const note = await noteRepository.restore(noteId);
    if (!note) throw new NotFoundError('Note not found');

    await this._invalidateCache(userId, noteId);
    await this._publishEvent('note:restore', note);
    return note;
  }

  async pin(noteId, userId) {
    await this._requirePermission(noteId, userId, 'write');
    const note = await noteRepository.togglePin(noteId, true);
    if (!note) throw new NotFoundError('Note not found');
    await this._invalidateCache(userId, noteId);
    return note;
  }

  async unpin(noteId, userId) {
    await this._requirePermission(noteId, userId, 'write');
    const note = await noteRepository.togglePin(noteId, false);
    if (!note) throw new NotFoundError('Note not found');
    await this._invalidateCache(userId, noteId);
    return note;
  }

  async favorite(noteId, userId) {
    await this._requirePermission(noteId, userId, 'read');
    const note = await noteRepository.toggleFavorite(noteId, true);
    if (!note) throw new NotFoundError('Note not found');
    await this._invalidateCache(userId, noteId);
    return note;
  }

  async unfavorite(noteId, userId) {
    await this._requirePermission(noteId, userId, 'read');
    const note = await noteRepository.toggleFavorite(noteId, false);
    if (!note) throw new NotFoundError('Note not found');
    await this._invalidateCache(userId, noteId);
    return note;
  }

  async duplicate(noteId, userId) {
    await this._requirePermission(noteId, userId, 'read');
    const note = await noteRepository.duplicate(noteId, userId);
    if (!note) throw new NotFoundError('Note not found');

    await activityLogRepository.create({
      userId,
      action: 'note_duplicated',
      entityType: 'note',
      entityId: note.id,
      metadata: { sourceId: noteId },
    });

    await this._invalidateCache(userId);
    return note;
  }

  async share(noteId, userId, { userId: targetUserId, email, permission }) {
    await this._requirePermission(noteId, userId, 'owner');

    let resolvedUserId = targetUserId;
    if (!resolvedUserId && email) {
      const targetUser = await userRepository.findByEmail(email);
      if (!targetUser) throw new NotFoundError('User not found with this email');
      resolvedUserId = targetUser.id;
    }
    if (resolvedUserId === userId) {
      throw new ForbiddenError('Cannot share a note with yourself');
    }

    const perm = await notePermissionRepository.create({
      noteId,
      userId: resolvedUserId,
      permission,
      grantedBy: userId,
    });

    const note = await noteRepository.findById(noteId);
    await notificationService.create({
      userId: resolvedUserId,
      type: 'note_shared',
      title: 'Note Shared',
      message: `A note "${note.title}" has been shared with you`,
      data: { noteId, permission },
    });

    await activityLogRepository.create({
      userId,
      action: 'note_shared',
      entityType: 'note',
      entityId: noteId,
      metadata: { targetUserId: resolvedUserId, permission },
    });

    return perm;
  }

  async getVersions(noteId, userId, options) {
    await this._requirePermission(noteId, userId, 'read');
    return noteVersionRepository.findByNoteId(noteId, options);
  }

  async restoreVersion(noteId, userId, versionNumber) {
    await this._requirePermission(noteId, userId, 'write');

    const version = await noteVersionRepository.findByVersion(noteId, versionNumber);
    if (!version) throw new NotFoundError('Version not found');

    return this.update(noteId, userId, { title: version.title, content: version.content });
  }

  async createTag(userId, data) {
    return tagRepository.create({ ...data, userId });
  }

  async getTags(userId, teamId) {
    return tagRepository.findByUser(userId, teamId);
  }

  async assignTag(noteId, userId, tagId) {
    await this._requirePermission(noteId, userId, 'write');
    return tagRepository.assignToNote(noteId, tagId);
  }

  async removeTag(noteId, userId, tagId) {
    await this._requirePermission(noteId, userId, 'write');
    await tagRepository.removeFromNote(noteId, tagId);
  }

  async getDashboardStats(userId) {
    const result = await noteRepository.search(userId, { page: 1, limit: 1 });
    const recent = await noteRepository.search(userId, { sort: 'updated', page: 1, limit: 5 });
    const shared = await noteRepository.search(userId, { shared: true, page: 1, limit: 5 });
    const favorites = await noteRepository.search(userId, { favorites: true, page: 1, limit: 5 });

    return {
      totalNotes: result.total,
      recentNotes: recent.notes,
      sharedNotes: shared.notes,
      favoriteNotes: favorites.notes,
    };
  }

  async ensureWriteAccess(noteId, userId) {
    return this._requirePermission(noteId, userId, 'write');
  }

  async _requirePermission(noteId, userId, required) {
    const permission = await noteRepository.getUserPermission(noteId, userId);
    if (!permission || !hasNotePermission(permission, required)) {
      throw new ForbiddenError(`Requires ${required} permission`);
    }
    return permission;
  }

  async _invalidateCache(userId, noteId = null) {
    await cacheDeletePattern(`notes:${userId}:*`);
    if (noteId) await cacheDeletePattern(`note:${noteId}:user:*`);
  }

  async _publishEvent(event, data) {
    await redisPub.publish(PUBSUB_CHANNELS.SOCKET_BROADCAST, JSON.stringify({ event, data }));
  }

  async _notifyCollaborators(noteId, excludeUserId, type, title, message) {
    const permissions = await notePermissionRepository.findByNote(noteId);
    for (const perm of permissions) {
      if (perm.user_id !== excludeUserId) {
        await notificationService.create({
          userId: perm.user_id,
          type,
          title,
          message,
          data: { noteId },
        });
      }
    }
  }
}

export default new NoteService();
