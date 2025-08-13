import { body } from 'express-validator';

export const updateNameValidator = [
  body('name')
    .isString()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
];

export const updatePasswordValidator = [
  body('currentPassword')
    .isString()
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isString()
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),
];
