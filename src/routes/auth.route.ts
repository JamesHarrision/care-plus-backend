import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();

router.post('/register',      authController.register);
router.post('/verify-email',  authController.verifyEmail);
router.post('/resend-verify', authController.resendVerify);
router.post('/login',         authController.login);
router.post('/refresh-token',   authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password',  authController.resetPassword);

router.post('/logout',          requireAuth, authController.logout);
router.post('/change-password', requireAuth, authController.changePassword);

export default router;