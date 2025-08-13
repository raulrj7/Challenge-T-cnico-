import { body } from 'express-validator';

export const reserveSpotValidator = [
  body('event')
    .notEmpty()
    .withMessage('Event ID is required')
    .isMongoId()
    .withMessage('Event ID must be a valid Mongo ID'),
];

export const cancelReservationValidator = [
  body('idReservation')
    .notEmpty()
    .withMessage('idReservation is required')
    .isMongoId()
    .withMessage('idReservation must be a valid Mongo ID'),
];
