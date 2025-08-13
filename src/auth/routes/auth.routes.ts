import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { registerValidator, loginValidator } from "../validators/auth.validator";
import { validateResult } from "../../middlewares/validateResult";

const router = Router();

router.post("/register", registerValidator, validateResult, authController.register);
router.post("/login", loginValidator, validateResult, authController.login);

export default router;
