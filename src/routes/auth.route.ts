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
 *     description: Creates a user account, marks it inactive, and sends a verification OTP to the registered email.
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
 *         description: Account created successfully and a verification OTP has been emailed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - status
 *                 - data
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   required:
 *                     - userId
 *                     - message
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
 *                 message: Đăng ký thành công. Vui lòng kiểm tra email để nhận mã OTP.
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
 *                   example: Số điện thoại hoặc Email đã được sử dụng
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
 *     description: Verifies the user account using the OTP sent during registration and returns a fresh token pair.
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
 *         description: Email verified successfully and the account is activated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - status
 *                 - data
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   required:
 *                     - message
 *                     - data
 *                   properties:
 *                     message:
 *                       type: string
 *                     data:
 *                       type: object
 *                       required:
 *                         - user
 *                         - tokens
 *                       properties:
 *                         user:
 *                           type: object
 *                           required:
 *                             - id
 *                             - system_role
 *                             - full_name
 *                           properties:
 *                             id:
 *                               type: string
 *                               format: uuid
 *                             system_role:
 *                               type: string
 *                               enum:
 *                                 - ADMIN
 *                                 - USER
 *                             full_name:
 *                               type: string
 *                         tokens:
 *                           type: object
 *                           required:
 *                             - accessToken
 *                             - refreshToken
 *                           properties:
 *                             accessToken:
 *                               type: string
 *                             refreshToken:
 *                               type: string
 *             example:
 *               status: success
 *               data:
 *                 message: Xác thực tài khoản thành công
 *                 data:
 *                   user:
 *                     id: fbb4d628-c84e-4b54-91aa-68f412ff9fef
 *                     system_role: USER
 *                     full_name: Nguyen Van A
 *                   tokens:
 *                     accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access.token
 *                     refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh.token
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
 *                   message: Mã OTP đã hết hạn hoặc không tồn tại
 *               otpInvalid:
 *                 value:
 *                   status: error
 *                   message: Mã OTP không chính xác
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
 *     description: Sends a new verification OTP to the registered email when the account still needs activation.
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
 *               required:
 *                 - status
 *                 - data
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   required:
 *                     - message
 *                   properties:
 *                     message:
 *                       type: string
 *             example:
 *               status: success
 *               data:
 *                 message: Đã gửi lại mã OTP. Vui lòng kiểm tra email.
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
 *                   example: Tài khoản đã được kích hoạt từ trước
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
 *                   example: Không tìm thấy tài khoản
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
 *     description: Authenticates a user using an email address or phone number and returns a fresh token pair.
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
 *               required:
 *                 - status
 *                 - data
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   required:
 *                     - user
 *                     - tokens
 *                   properties:
 *                     user:
 *                       type: object
 *                       required:
 *                         - id
 *                         - full_name
 *                         - system_role
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
 *                       required:
 *                         - accessToken
 *                         - refreshToken
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                         refreshToken:
 *                           type: string
 *             example:
 *               status: success
 *               data:
 *                 user:
 *                   id: 6f2d0c6a-7d1f-4bc3-9a80-1ed1fd5b3333
 *                   full_name: Nguyen Van A
 *                   system_role: USER
 *                 tokens:
 *                   accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access.token
 *                   refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh.token
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
 *                   example: Mật khẩu không chính xác
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
 *                   example: Tài khoản chưa được kích hoạt. Vui lòng xác thực email.
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
 *                   example: Không tìm thấy tài khoản
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
 *     description: Issues a new access and refresh token pair from a valid refresh token.
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
 *               required:
 *                 - status
 *                 - data
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   required:
 *                     - accessToken
 *                     - refreshToken
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *             example:
 *               status: success
 *               data:
 *                 accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access.token
 *                 refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh.token
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
 *                   message: Refresh Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.
 *               unavailableUser:
 *                 value:
 *                   status: error
 *                   message: Tài khoản không khả dụng
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
 *     description: Sends a password reset OTP to the registered email if the account exists.
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
 *               required:
 *                 - status
 *                 - data
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   required:
 *                     - message
 *                   properties:
 *                     message:
 *                       type: string
 *             example:
 *               status: success
 *               data:
 *                 message: Khôi phục mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.
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
 *                   example: Không tìm thấy tài khoản
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
 *               $ref: '#/components/schemas/ResetPasswordResponse'
 *             example:
 *               message: Đổi mật khẩu thành công
 *       '400':
 *         description: OTP invalid or expired.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               otpExpired:
 *                 value:
 *                   status: error
 *                   message: Mã OTP đã hết hạn hoặc không tồn tại
 *               otpInvalid:
 *                 value:
 *                   status: error
 *                   message: Mã OTP không chính xác
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: Lỗi máy chủ
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
 *               required:
 *                 - status
 *                 - data
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   required:
 *                     - message
 *                   properties:
 *                     message:
 *                       type: string
 *             example:
 *               status: success
 *               data:
 *                 message: Đăng xuất thành công
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
 *                   example: Không tìm thấy Access Token
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
 *                   message: Token không hợp lệ hoặc đã hết hạn
 *               invalidOrExpired:
 *                 value:
 *                   status: error
 *                   message: Token không hợp lệ hoặc đã hết hạn
 *               blacklisted:
 *                 value:
 *                   status: error
 *                   message: Token đã bị vô hiệu hóa (Đăng xuất)
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
 *               required:
 *                 - status
 *                 - data
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   required:
 *                     - message
 *                   properties:
 *                     message:
 *                       type: string
 *             example:
 *               status: success
 *               data:
 *                 message: Đổi mật khẩu thành công
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
 *                   example: Mật khẩu cũ không chính xác
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
 *                   message: Token không hợp lệ hoặc đã hết hạn
 *               invalidToken:
 *                 value:
 *                   status: error
 *                   message: Token không hợp lệ hoặc đã hết hạn
 *               noUser:
 *                 value:
 *                   status: error
 *                   message: Không thể xác thực danh tính người dùng
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
 *                   example: Không tìm thấy tài khoản
 *       '500':
 *         description: Internal server error.
 */
router.post('/change-password', requireAuth, authController.changePassword);

/**
 * @openapi
 * /api/auth/resend-verify-by-login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Resend verification OTP using login identifier
 *     description: Accepts an email address or phone number and resends the verification OTP for an account that has not been activated yet.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email address or phone number.
 *                 example: nguyenvana@example.com
 *     responses:
 *       '200':
 *         description: OTP resent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - status
 *                 - email
 *                 - data
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 email:
 *                   type: string
 *                   format: email
 *                 data:
 *                   type: object
 *                   required:
 *                     - message
 *                   properties:
 *                     message:
 *                       type: string
 *             example:
 *               status: success
 *               email: nguyenvana@example.com
 *               data:
 *                 message: Đã gửi lại mã OTP.
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
 *                   example: Tài khoản đã được kích hoạt từ trước
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
 *                   example: Không tìm thấy tài khoản
 *       '500':
 *         description: Internal server error.
 */
router.post('/resend-verify-by-login', authController.resendVerifyByLogin);

// =============== Quick Login (Device-Bound) ===============

/**
 * @openapi
 * /api/auth/quick-login/device:
 *   post:
 *     tags:
 *       - Quick Login
 *     summary: Quick login bằng device token
 *     description: Đăng nhập nhanh cho người già/trẻ nhỏ bằng device token đã được thiết lập bởi chủ hộ. Không cần tài khoản.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - device_token
 *               - device_fingerprint
 *             properties:
 *               device_token:
 *                 type: string
 *                 description: Device token nhận được khi thiết lập.
 *                 example: a1b2c3d4e5f6...
 *               device_fingerprint:
 *                 type: string
 *                 description: Fingerprint duy nhất của thiết bị.
 *                 example: fp_abc123xyz
 *     responses:
 *       '200':
 *         description: Quick login thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - status
 *                 - data
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     member:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         display_name:
 *                           type: string
 *                         family_id:
 *                           type: string
 *                         family_role:
 *                           type: string
 *                         permissions:
 *                           type: array
 *                           items:
 *                             type: string
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                         refreshToken:
 *                           type: string
 *       '400':
 *         description: Thiếu thông tin bắt buộc.
 *       '401':
 *         description: Device token không hợp lệ hoặc thiết bị chưa đăng ký.
 */
router.post('/quick-login/device', authController.quickLoginByDevice);

/**
 * @openapi
 * /api/auth/quick-login/refresh:
 *   post:
 *     tags:
 *       - Quick Login
 *     summary: Refresh token cho quick-login session
 *     description: Cấp lại token mới cho phiên đăng nhập nhanh. Dùng khi accessToken hết hạn.
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
 *     responses:
 *       '200':
 *         description: Token refreshed successfully.
 *       '401':
 *         description: Token không hợp lệ hoặc thiết bị đã bị thu hồi.
 */
router.post('/quick-login/refresh', authController.refreshQuickLoginToken);

export default router;

