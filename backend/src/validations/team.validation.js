import Joi from 'joi';

export const createTeamSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  description: Joi.string().max(1000).allow(''),
});

export const updateTeamSchema = Joi.object({
  name: Joi.string().min(2).max(255),
  description: Joi.string().max(1000).allow(''),
}).min(1);

export const inviteMemberSchema = Joi.object({
  email: Joi.string().email().required(),
  role: Joi.string().valid('admin', 'editor', 'viewer').default('viewer'),
});

export const updateMemberRoleSchema = Joi.object({
  role: Joi.string().valid('owner', 'admin', 'editor', 'viewer').required(),
});
