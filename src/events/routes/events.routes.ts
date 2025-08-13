import { Router } from 'express';
import { eventController } from '../controllers/event.controller';
import { createEventValidator } from '../validators/event.validator';
import { validateResult } from '../../middlewares/validateResult';
import { jwtMiddleware } from '../../middlewares/jwtMiddleware';

const router = Router();

router.get('/my-events', jwtMiddleware, eventController.listUserEvents);

router.get('/', eventController.listEvents);

router.post(
  '/',
  jwtMiddleware,
  createEventValidator,
  validateResult,
  eventController.createEvent
);

router.put(
  '/:id',
  jwtMiddleware,
  createEventValidator,
  validateResult,
  eventController.updateEvent
);

router.delete('/:id', jwtMiddleware, eventController.deleteEvent);

export default router;
