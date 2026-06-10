import { Router } from 'express';
import teamController from '../controllers/team.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  createTeamSchema,
  updateTeamSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
} from '../validations/team.validation.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createTeamSchema), teamController.create);
router.get('/', teamController.list);
router.get('/:teamId', teamController.get);
router.put('/:teamId', validate(updateTeamSchema), teamController.update);
router.delete('/:teamId', teamController.remove);
router.post('/:teamId/members', validate(inviteMemberSchema), teamController.invite);
router.delete('/:teamId/members/:memberId', teamController.removeMember);
router.patch('/:teamId/members/:memberId/role', validate(updateMemberRoleSchema), teamController.updateRole);

export default router;
