import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { jwtMiddleware } from '../../middlewares/jwtMiddleware';
import { updateNameValidator, updatePasswordValidator } from '../validators/user.validator';

const router = Router();

router.get('/me', jwtMiddleware, userController.getCurrentUser);

router.put('/me', jwtMiddleware, updateNameValidator, userController.updateName);

router.put('/password', jwtMiddleware, updatePasswordValidator, userController.updatePassword);

export default router;
