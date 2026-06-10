import noteService from '../services/note.service.js';
import { successResponse, paginatedResponse } from '../utils/response.js';

class NoteController {
  async create(req, res, next) {
    try {
      const note = await noteService.create(req.user.id, req.body);
      successResponse(res, note, 'Note created', 201);
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const result = await noteService.list(req.user.id, req.query);
      paginatedResponse(res, result.notes, { page: result.page, limit: result.limit, total: result.total });
    } catch (error) {
      next(error);
    }
  }

  async get(req, res, next) {
    try {
      const note = await noteService.getById(req.params.noteId, req.user.id);
      successResponse(res, note);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const createVersion = req.get('x-autosave') !== 'true';
      const note = await noteService.update(req.params.noteId, req.user.id, req.body, { createVersion });
      successResponse(res, note, 'Note updated');
    } catch (error) {
      next(error);
    }
  }

  async remove(req, res, next) {
    try {
      await noteService.delete(req.params.noteId, req.user.id);
      successResponse(res, null, 'Note deleted');
    } catch (error) {
      next(error);
    }
  }

  async archive(req, res, next) {
    try {
      const note = await noteService.archive(req.params.noteId, req.user.id);
      successResponse(res, note, 'Note archived');
    } catch (error) {
      next(error);
    }
  }

  async restore(req, res, next) {
    try {
      const note = await noteService.restore(req.params.noteId, req.user.id);
      successResponse(res, note, 'Note restored');
    } catch (error) {
      next(error);
    }
  }

  async pin(req, res, next) {
    try {
      const note = await noteService.pin(req.params.noteId, req.user.id);
      successResponse(res, note, 'Note pinned');
    } catch (error) {
      next(error);
    }
  }

  async unpin(req, res, next) {
    try {
      const note = await noteService.unpin(req.params.noteId, req.user.id);
      successResponse(res, note, 'Note unpinned');
    } catch (error) {
      next(error);
    }
  }

  async favorite(req, res, next) {
    try {
      const note = await noteService.favorite(req.params.noteId, req.user.id);
      successResponse(res, note, 'Note favorited');
    } catch (error) {
      next(error);
    }
  }

  async unfavorite(req, res, next) {
    try {
      const note = await noteService.unfavorite(req.params.noteId, req.user.id);
      successResponse(res, note, 'Note unfavorited');
    } catch (error) {
      next(error);
    }
  }

  async duplicate(req, res, next) {
    try {
      const note = await noteService.duplicate(req.params.noteId, req.user.id);
      successResponse(res, note, 'Note duplicated', 201);
    } catch (error) {
      next(error);
    }
  }

  async share(req, res, next) {
    try {
      const perm = await noteService.share(req.params.noteId, req.user.id, req.body);
      successResponse(res, perm, 'Note shared', 201);
    } catch (error) {
      next(error);
    }
  }

  async versions(req, res, next) {
    try {
      const result = await noteService.getVersions(req.params.noteId, req.user.id, req.query);
      paginatedResponse(res, result.versions, { page: result.page, limit: result.limit, total: result.total });
    } catch (error) {
      next(error);
    }
  }

  async restoreVersion(req, res, next) {
    try {
      const note = await noteService.restoreVersion(req.params.noteId, req.user.id, parseInt(req.params.version, 10));
      successResponse(res, note, 'Version restored');
    } catch (error) {
      next(error);
    }
  }

  async dashboard(req, res, next) {
    try {
      const stats = await noteService.getDashboardStats(req.user.id);
      successResponse(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async createTag(req, res, next) {
    try {
      const tag = await noteService.createTag(req.user.id, req.body);
      successResponse(res, tag, 'Tag created', 201);
    } catch (error) {
      next(error);
    }
  }

  async listTags(req, res, next) {
    try {
      const tags = await noteService.getTags(req.user.id, req.query.teamId);
      successResponse(res, tags);
    } catch (error) {
      next(error);
    }
  }

  async assignTag(req, res, next) {
    try {
      const result = await noteService.assignTag(req.params.noteId, req.user.id, req.params.tagId);
      successResponse(res, result, 'Tag assigned');
    } catch (error) {
      next(error);
    }
  }

  async removeTag(req, res, next) {
    try {
      await noteService.removeTag(req.params.noteId, req.user.id, req.params.tagId);
      successResponse(res, null, 'Tag removed');
    } catch (error) {
      next(error);
    }
  }
}

export default new NoteController();
