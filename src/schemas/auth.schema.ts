import Joi from "joi";

export const createAdminSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).required(),
  email: Joi.string().email().required(),
  name: Joi.string().min(2).max(255).required(),
});

export const updateAdminSchema = Joi.object({
  username: Joi.string().min(3).max(50).optional(),
  password: Joi.string().min(6).optional(),
  email: Joi.string().email().optional(),
  name: Joi.string().min(2).max(255).optional(),
});

export const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

export const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});
