import { Request, Response, NextFunction } from "express";
import { validationResult, FieldValidationError } from "express-validator";

export const validateResult = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => {
      const e = err as FieldValidationError;
      return {
        field: e.path,
        message: e.msg
      };
    });

    res.status(400).json({
      success: false,
      errors: formattedErrors
    });
    return;
  }

  next();
};
