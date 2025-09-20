import Joi from "joi";

export const createQueueSchema = Joi.object({
  number: Joi.number().integer().min(1).required(),
  counterId: Joi.number().integer().positive().required(),
  status: Joi.string().valid('claimed', 'called', 'served', 'skipped', 'released').optional().default('claimed'),
});

export const updateQueueSchema = Joi.object({
  number: Joi.number().integer().min(1).optional(),
  status: Joi.string().valid('claimed', 'called', 'served', 'skipped', 'released').optional(),
  counterId: Joi.number().integer().positive().optional(),
});

export const updateQueueStatusSchema = Joi.object({
  status: Joi.string().valid('claimed', 'called', 'served', 'skipped', 'released').required(),
});

export const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const counterIdParamSchema = Joi.object({
  counter_id: Joi.number().integer().positive().required(),
});

export const resetQueueSchema = Joi.object({
  counter_id: Joi.number().integer().positive().optional(),
});