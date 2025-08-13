import { body } from 'express-validator';

export const createEventValidator = [
  body('name').isString().notEmpty().withMessage('El nombre es obligatorio'),
  body('date').isISO8601().withMessage('La fecha debe ser válida').custom(value => {
    const inputDate = new Date(value);
    if (inputDate <= new Date()) {
      throw new Error('La fecha debe ser futura');
    }
    return true;
  }),
  body('location').isString().notEmpty().withMessage('La ubicación es obligatoria'),
  body('capacity').isInt({ min: 1 }).withMessage('La capacidad debe ser un número entero mayor a 0')
];
