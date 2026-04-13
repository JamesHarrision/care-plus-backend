import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { AuthRequest } from '../interfaces/interfaces';
import { userRepository } from '../repositories/user.repository';
const router = Router();

/**
 * @openapi
 * /api/user/me:
 *   get:
 *     tags:
 *       - User
 *     summary: Get current user
 *     description: Returns the authenticated user's merged profile data, including the token role and the latest database record.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Authenticated user fetched successfully.
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
 *                     - id
 *                     - role
 *                     - full_name
 *                     - system_role
 *                     - is_active
 *                     - created_at
 *                     - updated_at
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     role:
 *                       type: string
 *                       enum:
 *                         - ADMIN
 *                         - USER
 *                     full_name:
 *                       type: string
 *                     phone:
 *                       type: string
 *                       nullable: true
 *                     email:
 *                       type: string
 *                       format: email
 *                       nullable: true
 *                     system_role:
 *                       type: string
 *                       enum:
 *                         - ADMIN
 *                         - USER
 *                     is_active:
 *                       type: boolean
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *             example:
 *               status: success
 *               data:
 *                 id: 6f2d0c6a-7d1f-4bc3-9a80-1ed1fd5b3333
 *                 role: USER
 *                 full_name: Nguyen Van A
 *                 phone: '0912345678'
 *                 email: nguyenvana@example.com
 *                 system_role: USER
 *                 is_active: true
 *                 created_at: '2026-04-10T00:00:00.000Z'
 *                 updated_at: '2026-04-10T00:00:00.000Z'
 *       '401':
 *         description: Missing or invalid access token.
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
 *             example:
 *               status: error
 *               message: Không tồn tại người dùng.
 *       '500':
 *         description: Internal server error.
 */
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const user = req.user;
  // Chỉ check nếu user tồn tại, vì requireAuth đã đảm bảo điều này. Dùng ở file entry

  const account = await userRepository.findById(req.user?.id as string);
  if (!account) {
    return res.status(404).json({ status: 'error', message: 'Không tồn tại người dùng.' });
  }
  const { password_hash, ...rest } = account;
  const userInfo = {
    ...user,
    ...rest,
  }; // Không trả về password
  return res.status(200).json({ status: 'success', data: userInfo });
});

/**
 * @openapi
 * /api/user/device-token:
 *   post:
 *     tags:
 *       - User
 *     summary: Cập nhật FCM device token
 *     description: Endpoint này lưu FCM device token của user vào bảng FamilyMember (tìm theo user_id). Dùng để sau này worker gửi push notification.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceToken
 *             properties:
 *               deviceToken:
 *                 type: string
 *                 description: FCM token để gửi push notification
 *     responses:
 *       '200':
 *         description: Cập nhật thành công
 *       '401':
 *         description: Chưa xác thực
 */
router.post('/device-token', requireAuth, async (req: AuthRequest, res) => {
  const { deviceToken } = req.body;
  if (!deviceToken) {
    return res.status(400).json({ status: 'error', message: 'deviceToken is required' });
  }

  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }

  try {
    const { prisma } = await import('../config/prisma.config');
    await prisma.familyMember.updateMany({
      where: { user_id: userId },
      data: { device_token: deviceToken }
    });

    return res.status(200).json({
      status: 'success',
      data: { message: 'Cập nhật device token thành công' }
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật device token:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

export default router;
