import { Router } from 'express';
import { signup, login, signupSchema, loginSchema } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);

export default router;
