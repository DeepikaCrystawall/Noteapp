import { Router } from 'express';
import noteController from '../controllers/note.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  createNoteSchema,
  updateNoteSchema,
  shareNoteSchema,
  searchNotesSchema,
  createTagSchema,
} from '../validations/note.validation.js';

const router = Router();

router.use(authenticate);

router.get('/dashboard', noteController.dashboard);
router.get('/tags', noteController.listTags);
router.post('/tags', validate(createTagSchema), noteController.createTag);

router.get('/', validate(searchNotesSchema, 'query'), noteController.list);
router.post('/', validate(createNoteSchema), noteController.create);
router.get('/:noteId', noteController.get);
router.put('/:noteId', validate(updateNoteSchema), noteController.update);
router.delete('/:noteId', noteController.remove);
router.post('/:noteId/archive', noteController.archive);
router.post('/:noteId/restore', noteController.restore);
router.post('/:noteId/pin', noteController.pin);
router.post('/:noteId/unpin', noteController.unpin);
router.post('/:noteId/favorite', noteController.favorite);
router.post('/:noteId/unfavorite', noteController.unfavorite);
router.post('/:noteId/duplicate', noteController.duplicate);
router.post('/:noteId/share', validate(shareNoteSchema), noteController.share);
router.get('/:noteId/versions', noteController.versions);
router.post('/:noteId/versions/:version/restore', noteController.restoreVersion);
router.post('/:noteId/tags/:tagId', noteController.assignTag);
router.delete('/:noteId/tags/:tagId', noteController.removeTag);

export default router;
