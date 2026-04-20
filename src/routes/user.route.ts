import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { AuthRequest } from '../interfaces/interfaces';
import { userRepository } from '../repositories/user.repository';
import { familyRepository } from '../repositories/family.repository';
const router = Router();

/**
 * @openapi
 * /api/user/me:
 *   get:
 *     tags:
 *       - User
 *     summary: Get current user
 *     description: Returns the authenticated user's profile data. Normal accounts receive the latest user record, while quick-login members receive the linked family-member profile.
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
 *                     - full_name
 *                     - system_role
 *                     - is_active
 *                     - created_at
 *                     - family
 *                     - loginType
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     role:
 *                       type: string
 *                       enum:
 *                         - ADMIN
 *                         - USER
 *                       description: Present for normal accounts.
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
 *                     avatar_url:
 *                       type: string
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     family:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UserMeFamily'
 *                     loginType:
 *                       type: string
 *                       enum:
 *                         - full
 *                         - quick_login
 *             examples:
 *               regularUser:
 *                 value:
 *                   status: success
 *                   data:
 *                     id: 6f2d0c6a-7d1f-4bc3-9a80-1ed1fd5b3333
 *                     role: USER
 *                     full_name: Nguyen Van A
 *                     phone: '0912345678'
 *                     email: nguyenvana@example.com
 *                     system_role: USER
 *                     is_active: true
 *                     avatar_url: null
 *                     created_at: '2026-04-10T00:00:00.000Z'
 *                     updated_at: '2026-04-10T00:00:00.000Z'
 *                     family:
 *                       - family_id: 8c8f0df7-1e1f-4e5f-8b98-f6f5d7c8f111
 *                         family_role: OWNER
 *                         family_relation: null
 *                         family:
 *                           id: 8c8f0df7-1e1f-4e5f-8b98-f6f5d7c8f111
 *                           name: Gia đình Nguyễn Văn A
 *                           address: 123 Đường ABC, TP.HCM
 *                           invite_code: null
 *                           invite_code_exp: null
 *                           created_at: '2026-04-10T00:00:00.000Z'
 *                           updated_at: '2026-04-10T00:00:00.000Z'
 *                     loginType: full
 *               quickLoginMember:
 *                 value:
 *                   status: success
 *                   data:
 *                     id: 6f2d0c6a-7d1f-4bc3-9a80-1ed1fd5b4444
 *                     full_name: Thành viên gia đình
 *                     phone: null
 *                     email: null
 *                     system_role: USER
 *                     is_active: true
 *                     avatar_url: https://example.com/avatar.png
 *                     created_at: '2026-04-10T00:00:00.000Z'
 *                     family:
 *                       - family_id: 8c8f0df7-1e1f-4e5f-8b98-f6f5d7c8f111
 *                         family_role: MEMBER
 *                         family_relation: CON
 *                         family:
 *                           id: 8c8f0df7-1e1f-4e5f-8b98-f6f5d7c8f111
 *                           name: Gia đình Nguyễn Văn A
 *                           address: 123 Đường ABC, TP.HCM
 *                           invite_code: null
 *                           invite_code_exp: null
 *                           created_at: '2026-04-10T00:00:00.000Z'
 *                           updated_at: '2026-04-10T00:00:00.000Z'
 *                     loginType: quick_login
 *       '401':
 *         description: Missing or invalid access token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: Token không hợp lệ hoặc đã hết hạn
 *       '404':
 *         description: User account or family member not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: Không tồn tại người dùng.
 *       '500':
 *         description: Internal server error.
 */
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  // Case 1: Quick Login Member
  if (req.quickLoginMember) {
    const member = await familyRepository.findMemberById(req.quickLoginMember.memberId);
    if (!member) {
      return res.status(404).json({ status: 'error', message: 'Không tồn tại thành viên gia đình.' });
    }

    // Trả về profile tương thích cho quick-login member
    const userInfo = {
      id: member.id,
      full_name: member.display_name || member.user?.full_name || 'Thành viên gia đình',
      phone: member.user?.phone || null,
      email: member.user?.email || null,
      system_role: 'USER', // Quick login member mặc định là USER
      is_active: true,
      avatar_url: member.user?.avatar_url || null,
      created_at: member.created_at,
      family: [
        {
          family_id: member.family_id,
          family_role: member.family_role,
          family_relation: member.family_relation,
          family: member.family,
        },
      ],
      loginType: 'quick_login',
    };

    return res.status(200).json({ status: 'success', data: userInfo });
  }

  // Case 2: Normal User
  const user = req.user;
  if (!user?.id) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }

  const account = await userRepository.findById(user.id, true);
  if (!account) {
    return res.status(404).json({ status: 'error', message: 'Không tồn tại người dùng.' });
  }

  const { password_hash, familyMembers, ...rest } = account;
  const userInfo = {
    ...user,
    ...rest,
    family: familyMembers,
    loginType: 'full',
  };

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
 *                   $ref: '#/components/schemas/DeviceTokenResponse'
 *             example:
 *               status: success
 *               data:
 *                 message: Cập nhật device token thành công
 *       '400':
 *         description: deviceToken is required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: deviceToken is required
 *       '401':
 *         description: Chưa xác thực
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: Unauthorized
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: Internal server error
 */
router.post('/device-token', requireAuth, async (req: AuthRequest, res) => {
  const { deviceToken } = req.body;
  if (deviceToken === undefined) {
    return res.status(400).json({ status: 'error', message: 'deviceToken is required' });
  }

  // Case 1: Quick Login Member
  if (req.quickLoginMember) {
    try {
      const { prisma } = await import('../config/prisma.config');
      await prisma.familyMember.update({
        where: { id: req.quickLoginMember.memberId },
        data: { device_token: deviceToken },
      });

      return res.status(200).json({
        status: 'success',
        data: { message: 'Cập nhật FCM device token cho thiết bị thành công' },
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật device token (quick login):', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

  // Case 2: Normal User
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }

  try {
    const { prisma } = await import('../config/prisma.config');
    await prisma.familyMember.updateMany({
      where: { user_id: userId },
      data: { device_token: deviceToken },
    });

    return res.status(200).json({
      status: 'success',
      data: { message: 'Cập nhật device token thành công' },
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật device token:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

export default router;
