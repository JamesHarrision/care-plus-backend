import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new account
 *     description: Creates a user account and sends an OTP to the provided email for account verification.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - phone
 *               - email
 *               - password
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: Nguyen Van A
 *               phone:
 *                 type: string
 *                 example: 0912345678
 *               email:
 *                 type: string
 *                 format: email
 *                 example: nguyenvana@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: StrongPass123
 *     responses:
 *       '201':
 *         description: Account created successfully and OTP is sent.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                     message:
 *                       type: string
 *             example:
 *               status: success
 *               data:
 *                 userId: fbb4d628-c84e-4b54-91aa-68f412ff9fef
 *                 message: Registration completed. Check your email for OTP.
 *       '409':
 *         description: Phone number or email already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Phone number or email is already in use.
 *       '500':
 *         description: Internal server error.
 */
router.post('/register', authController.register);

/**
 * @openapi
 * /api/auth/verify-email:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Verify account email
 *     description: Verifies the user account using OTP sent to email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: nguyenvana@example.com
 *               otp:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       '200':
 *         description: Email verified successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *             example:
 *               status: success
 *               data:
 *                 message: Account verification successful.
 *       '400':
 *         description: OTP is invalid or expired.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *             examples:
 *               otpExpired:
 *                 value:
 *                   status: error
 *                   message: OTP is expired or does not exist.
 *               otpInvalid:
 *                 value:
 *                   status: error
 *                   message: OTP is invalid.
 *       '500':
 *         description: Internal server error.
 */
router.post('/verify-email', authController.verifyEmail);

/**
 * @openapi
 * /api/auth/resend-verify:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Resend verification OTP
 *     description: Sends a new OTP to email if account exists and is not active.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: nguyenvana@example.com
 *     responses:
 *       '200':
 *         description: OTP resent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *       '400':
 *         description: Account is already active.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Account is already active.
 *       '404':
 *         description: Account not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Account not found.
 *       '500':
 *         description: Internal server error.
 */
router.post('/resend-verify', authController.resendVerify);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login with email or phone
 *     description: Authenticates user with identifier and password, then returns access and refresh tokens.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email or phone number.
 *                 example: nguyenvana@example.com
 *               password:
 *                 type: string
 *                 example: StrongPass123
 *     responses:
 *       '200':
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         full_name:
 *                           type: string
 *                         system_role:
 *                           type: string
 *                           enum:
 *                             - ADMIN
 *                             - USER
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                         refreshToken:
 *                           type: string
 *       '401':
 *         description: Wrong password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Password is incorrect.
 *       '403':
 *         description: Account is not activated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Account is not activated.
 *       '404':
 *         description: Account not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Account not found.
 *       '500':
 *         description: Internal server error.
 */
router.post('/login', authController.login);

/**
 * @openapi
 * /api/auth/refresh-token:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Refresh access token
 *     description: Issues a new access/refresh token pair from a valid refresh token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh.token
 *     responses:
 *       '200':
 *         description: Token pair refreshed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       '401':
 *         description: Refresh token is invalid, expired, or user is unavailable.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *             examples:
 *               invalidToken:
 *                 value:
 *                   status: error
 *                   message: Refresh token is invalid or expired.
 *               unavailableUser:
 *                 value:
 *                   status: error
 *                   message: Account is unavailable.
 *       '500':
 *         description: Internal server error.
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Request password reset OTP
 *     description: Sends a password reset OTP to email if the account exists.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: nguyenvana@example.com
 *     responses:
 *       '200':
 *         description: OTP sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *       '404':
 *         description: Account not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Account not found.
 *       '500':
 *         description: Internal server error.
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Reset password with OTP
 *     description: Resets account password using email, OTP, and new password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: nguyenvana@example.com
 *               otp:
 *                 type: string
 *                 example: 654321
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: NewStrongPass456
 *     responses:
 *       '200':
 *         description: Password reset successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password changed successfully.
 *       '400':
 *         description: OTP invalid or expired.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *             examples:
 *               otpExpired:
 *                 value:
 *                   status: error
 *                   message: OTP is expired or does not exist.
 *               otpInvalid:
 *                 value:
 *                   status: error
 *                   message: OTP is invalid.
 *       '500':
 *         description: Internal server error.
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logout current account
 *     description: Invalidates current access token by adding it to token blacklist.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Logout successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *       '400':
 *         description: Access token is not found in request headers.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Access token is missing.
 *       '401':
 *         description: Missing, invalid, expired, or blacklisted token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *             examples:
 *               missing:
 *                 value:
 *                   status: error
 *                   message: Access token not found.
 *               invalidOrExpired:
 *                 value:
 *                   status: error
 *                   message: Token is invalid or expired.
 *               blacklisted:
 *                 value:
 *                   status: error
 *                   message: Token is blacklisted.
 *       '500':
 *         description: Internal server error.
 */
router.post('/logout', requireAuth, authController.logout);

/**
 * @openapi
 * /api/auth/change-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Change password for logged-in user
 *     description: Changes password using old password and new password for authenticated account.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: OldStrongPass123
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: NewStrongPass456
 *     responses:
 *       '200':
 *         description: Password changed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *       '400':
 *         description: Old password is incorrect.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Old password is incorrect.
 *       '401':
 *         description: Unauthorized request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *             examples:
 *               noToken:
 *                 value:
 *                   status: error
 *                   message: Access token not found.
 *               invalidToken:
 *                 value:
 *                   status: error
 *                   message: Token is invalid or expired.
 *       '404':
 *         description: User account not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Account not found.
 *       '500':
 *         description: Internal server error.
 */
router.post('/change-password', requireAuth, authController.changePassword);

export default router;
