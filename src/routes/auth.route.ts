import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

router.post('/register',      authController.register);
router.post('/verify-email',  authController.verifyEmail);
router.post('/resend-verify', authController.resendVerify);
router.post('/login',         authController.login);

export default router;