import Joi from "joi";

export const createCounterSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  maxQueue: Joi.number().integer().min(1).max(999).optional().default(99),
});

export const updateCounterSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  maxQueue: Joi.number().integer().min(1).max(999).optional(),
  currentQueue: Joi.number().integer().min(0).optional(),
});

export const updateCounterStatusSchema = Joi.object({
  status: Joi.string().valid('active', 'inactive', 'disable').required(),
});

export const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});