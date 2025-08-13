import { Router } from 'express';
import { reservationController } from '../controllers/reservation.controller';
import { reserveSpotValidator, cancelReservationValidator } from '../validators/reservations.validator';
import { validateResult } from '../../middlewares/validateResult';
import { jwtMiddleware } from '../../middlewares/jwtMiddleware';

const router = Router();

router.post('/', jwtMiddleware, reserveSpotValidator, validateResult, reservationController.reserveSpot);
router.post('/cancel', jwtMiddleware, cancelReservationValidator, validateResult, reservationController.cancelReservation);
router.get('/my-reservations', jwtMiddleware, reservationController.listReservations);

export default router;
