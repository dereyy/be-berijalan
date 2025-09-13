import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const MValidate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const message = error.details && error.details[0] ? error.details[0].message : "Validation error";
      const validationError = new Error(message);
      next(validationError);
    } else {
      next();
    }
  };
};

export const MValidateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.params, { abortEarly: false });

    if (error) {
      const message = error.details && error.details[0] ? error.details[0].message : "Validation error";
      const validationError = new Error(message);
      next(validationError);
    } else {
      next();
    }
  };
};

export const MValidateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.query, { abortEarly: false });

    if (error) {
      const message = error.details && error.details[0] ? error.details[0].message : "Validation error";
      const validationError = new Error(message);
      next(validationError);
    } else {
      next();
    }
  };
};
