import Joi from "joi";

export const createNoteSchema = Joi.object({
  title: Joi.string().max(500).default("Untitled"),
  content: Joi.string().allow("").default(""),
  teamId: Joi.string().uuid().allow(null),
});

export const updateNoteSchema = Joi.object({
  title: Joi.string().max(500),
  content: Joi.string().allow(""),
}).min(1);

export const shareNoteSchema = Joi.object({
  userId: Joi.string().uuid(),
  email: Joi.string().email(),
  permission: Joi.string().valid("read", "write", "owner").default("read"),
}).xor("userId", "email");

export const searchNotesSchema = Joi.object({
  q: Joi.string().allow("").default(""),
  archived: Joi.boolean(),
  shared: Joi.boolean(),
  owned: Joi.boolean(),
  favorites: Joi.boolean(),
  sort: Joi.string()
    .valid("latest", "oldest", "title", "updated")
    .default("updated"),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  teamId: Joi.string().uuid(),
  tagId: Joi.string().uuid(),
});

export const createTagSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  color: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .default("#6366f1"),
  teamId: Joi.string().uuid().allow(null),
});
