import { Router } from 'express';
import { FamilyController } from '../controllers/familyController';
import { requireAuth, requireFamilyContext, requireSystemRole } from '../middlewares/auth.middleware';
import medicationRoutes from './medication.route';
import healthRoutes from './health.route';

const router = Router();
const familyController = new FamilyController();

/**
 * @openapi
 * /api/family:
 *   get:
 *     tags:
 *       - Family
 *     summary: Get user families
 *     description: Retrieves a list of families the authenticated user is a member of.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: List of families retrieved successfully.
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
 *                     - families
 *                   properties:
 *                     families:
 *                       type: array
 *                       items:
 *                         type: object
 *                         required:
 *                           - family_id
 *                           - family_name
 *                           - family_role
 *                           - joined_at
 *                         properties:
 *                           family_id:
 *                             type: string
 *                             format: uuid
 *                           family_name:
 *                             type: string
 *                           family_address:
 *                             type: string
 *                             nullable: true
 *                           family_role:
 *                             type: string
 *                             enum: [OWNER, MEMBER]
 *                           joined_at:
 *                             type: string
 *                             format: date-time
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
 *       '500':
 *         description: Internal server error.
 */
router.get('/', requireAuth, familyController.getUserFamilies);

/**
 * @openapi
 * /api/family:
 *   post:
 *     tags:
 *       - Family
 *     summary: Create a family
 *     description: Creates a new family and assigns the authenticated user as the owner.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Gia đình Nguyễn Văn A
 *               address:
 *                 type: string
 *                 nullable: true
 *                 example: 123 Đường ABC, TP.HCM
 *     responses:
 *       '201':
 *         description: Family created successfully.
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
 *                     - family
 *                   properties:
 *                     family:
 *                       type: object
 *                       required:
 *                         - id
 *                         - name
 *                         - created_at
 *                         - updated_at
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         address:
 *                           type: string
 *                           nullable: true
 *                         invite_code:
 *                           type: string
 *                           nullable: true
 *                         invite_code_exp:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                         updated_at:
 *                           type: string
 *                           format: date-time
 *             example:
 *               status: success
 *               data:
 *                 family:
 *                   id: 8c8f0df7-1e1f-4e5f-8b98-f6f5d7c8f111
 *                   name: Gia đình Nguyễn Văn A
 *                   address: 123 Đường ABC, TP.HCM
 *                   invite_code: null
 *                   invite_code_exp: null
 *                   created_at: '2026-04-10T00:00:00.000Z'
 *                   updated_at: '2026-04-10T00:00:00.000Z'
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
 *             example:
 *               status: error
 *               message: Token không hợp lệ hoặc đã hết hạn
 *       '500':
 *         description: Internal server error.
 */
router.post('/', requireAuth, familyController.createFamily);

/**
 * @openapi
 * /api/family/join:
 *   post:
 *     tags:
 *       - Family
 *     summary: Join a family with invite code
 *     description: Sends a join request for the authenticated user using a valid invite code.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inviteCode
 *             properties:
 *               inviteCode:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *                 example: ABC123
 *     responses:
 *       '200':
 *         description: Join request sent successfully.
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
 *                 message: Yêu cầu tham gia đã được gửi, chờ chủ nhà duyệt.
 *       '400':
 *         description: Invite code is invalid or expired.
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
 *               message: Mã không hợp lệ hoặc đã hết hạn
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
 *             example:
 *               status: error
 *               message: Token không hợp lệ hoặc đã hết hạn
 *       '409':
 *         description: User is already a member or has a pending request.
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
 *               message: Người dùng đã là thành viên hoặc đang chờ duyệt
 *       '500':
 *         description: Internal server error.
 */
router.post('/join', requireAuth, familyController.joinFamily);

/**
 * @openapi
 * /api/family/{familyId}/generate-invite:
 *   post:
 *     tags:
 *       - Family
 *     summary: Generate family invite code
 *     description: Generates a short-lived invite code for the family owner.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Family identifier.
 *     responses:
 *       '200':
 *         description: Invite code generated successfully.
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
 *                     - inviteCode
 *                     - expiresIn
 *                   properties:
 *                     inviteCode:
 *                       type: string
 *                       example: ABC123
 *                     expiresIn:
 *                       type: integer
 *                       example: 300
 *             example:
 *               status: success
 *               data:
 *                 inviteCode: ABC123
 *                 expiresIn: 300
 *       '400':
 *         description: Family ID or user information is missing.
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
 *               message: Thiếu thông tin Family ID hoặc User
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
 *             example:
 *               status: error
 *               message: Token không hợp lệ hoặc đã hết hạn
 *       '403':
 *         description: Authenticated user is not the owner of the family or is not part of the family.
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
 *               notFamilyMember:
 *                 value:
 *                   status: error
 *                   message: Bạn không phải là thành viên của gia đình này
 *               insufficientRole:
 *                 value:
 *                   status: error
 *                   message: Quyền hạn trong gia đình không đủ
 *       '500':
 *         description: Internal server error.
 */
router.post(
  '/:familyId/generate-invite',
  requireAuth,
  requireFamilyContext(['OWNER']),
  familyController.generateInvite,
);

/**
 * @openapi
 * /api/family/{familyId}/pending-members:
 *   get:
 *     tags:
 *       - Family
 *     summary: List pending family members
 *     description: Returns all pending join requests for the family.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Family identifier.
 *     responses:
 *       '200':
 *         description: Pending members fetched successfully.
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
 *                     - members
 *                   properties:
 *                     members:
 *                       type: array
 *                       items:
 *                         type: object
 *                         required:
 *                           - id
 *                           - join_status
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           user_id:
 *                             type: string
 *                             format: uuid
 *                             nullable: true
 *                           full_name:
 *                             type: string
 *                             nullable: true
 *                           email:
 *                             type: string
 *                             format: email
 *                             nullable: true
 *                           phone:
 *                             type: string
 *                             nullable: true
 *                           join_status:
 *                             type: string
 *                             enum:
 *                               - PENDING
 *                               - APPROVED
 *                               - REJECTED
 *             example:
 *               status: success
 *               data:
 *                 members:
 *                   - id: 4e0c7c50-1d7f-4b7a-a5e2-2f2a3a0c2222
 *                     user_id: a1b2c3d4-5e6f-7890-abcd-ef0123456789
 *                     full_name: Nguyen Van B
 *                     email: nguyenvanb@example.com
 *                     phone: '0912345678'
 *                     join_status: PENDING
 *       '400':
 *         description: Family ID or user information is missing.
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
 *               message: Thiếu thông tin Family ID hoặc User
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
 *             example:
 *               status: error
 *               message: Token không hợp lệ hoặc đã hết hạn
 *       '403':
 *         description: Authenticated user is not the owner of the family or is not part of the family.
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
 *               notFamilyMember:
 *                 value:
 *                   status: error
 *                   message: Bạn không phải là thành viên của gia đình này
 *               insufficientRole:
 *                 value:
 *                   status: error
 *                   message: Quyền hạn trong gia đình không đủ
 *       '500':
 *         description: Internal server error.
 */
router.get(
  '/:familyId/pending-members',
  requireAuth,
  requireFamilyContext(['OWNER']),
  familyController.getPendingMember,
);

/**
 * @openapi
 * /api/family/{familyId}/members/{memberId}/status:
 *   patch:
 *     tags:
 *       - Family
 *     summary: Review a join request
 *     description: Approves or rejects a pending family join request.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Family identifier.
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User identifier of the pending member.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - APPROVED
 *                   - REJECTED
 *                 example: APPROVED
 *     responses:
 *       '200':
 *         description: Join request updated successfully.
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
 *                 message: Cập nhật trạng thái thành công
 *       '400':
 *         description: Join request was not found or the provided status was invalid.
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
 *               message: Không tìm thấy yêu cầu
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
 *             example:
 *               status: error
 *               message: Token không hợp lệ hoặc đã hết hạn
 *       '403':
 *         description: Authenticated user is not the owner of the family or is not part of the family.
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
 *               notFamilyMember:
 *                 value:
 *                   status: error
 *                   message: Bạn không phải là thành viên của gia đình này
 *               insufficientRole:
 *                 value:
 *                   status: error
 *                   message: Quyền hạn trong gia đình không đủ
 */
router.patch(
  '/:familyId/members/:memberId/status',
  requireAuth,
  requireFamilyContext(['OWNER']),
  familyController.reviewJoinRequest,
);

/**
 * @openapi
 * /api/family/{familyId}/members/guest:
 *   post:
 *     tags:
 *       - Family
 *     summary: Tạo thành viên phụ (Guest Member)
 *     description: Chủ hộ tạo trực tiếp một thành viên không có tài khoản hệ thống (không cần email/SĐT). Trạng thái sẽ là APPROVED ngay lập tức.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - displayName
 *             properties:
 *               displayName:
 *                 type: string
 *                 example: Ông Nội
 *               relation:
 *                 type: string
 *                 example: Ông
 *     responses:
 *       '201':
 *         description: Tạo thành viên thành công.
 *       '403':
 *         description: Không có quyền chủ hộ.
 */
router.post(
  '/:familyId/members/guest',
  requireAuth,
  requireFamilyContext(['OWNER']),
  familyController.createGuestMember,
);

/**
 * @openapi
 * /api/family/{familyId}/members:
 *   get:
 *     tags:
 *       - Family
 *     summary: Get family members
 *     description: Retrieves a list of all members in the specified family. Both OWNER and MEMBER can access this.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Family identifier
 *     responses:
 *       '200':
 *         description: List of family members retrieved successfully.
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
 *                     - members
 *                   properties:
 *                     members:
 *                       type: array
 *                       items:
 *                         type: object
 *                         required:
 *                           - member_id
 *                           - family_role
 *                           - joined_at
 *                         properties:
 *                           member_id:
 *                             type: string
 *                             format: uuid
 *                           user_id:
 *                             type: string
 *                             format: uuid
 *                             nullable: true
 *                           full_name:
 *                             type: string
 *                             nullable: true
 *                           email:
 *                             type: string
 *                             format: email
 *                             nullable: true
 *                           phone:
 *                             type: string
 *                             nullable: true
 *                           family_role:
 *                             type: string
 *                             enum: [OWNER, MEMBER]
 *                           date_of_birth:
 *                             type: string
 *                             format: date
 *                             nullable: true
 *                           avatar_url:
 *                             type: string
 *                             format: uri
 *                             nullable: true
 *                           joined_at:
 *                             type: string
 *                             format: date-time
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
 *       '403':
 *         description: Forbidden (Not a member of the family).
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
 *       '500':
 *         description: Internal Server Error.
 */
router.get(
  '/:familyId/members',
  requireAuth,
  requireFamilyContext(['OWNER', 'MEMBER']),
  familyController.getFamilyMembers,
);

// =============== Quick Login (Device-Bound) ===============

/**
 * @openapi
 * /api/family/{familyId}/members/{memberId}/setup-device:
 *   post:
 *     tags:
 *       - Quick Login
 *     summary: Thiết lập đăng nhập nhanh cho thành viên
 *     description: Chủ hộ thiết lập quick-login trên thiết bị của thành viên (người già/trẻ nhỏ). Trả về device_token chỉ 1 lần.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - device_fingerprint
 *             properties:
 *               device_fingerprint:
 *                 type: string
 *                 example: fp_abc123xyz
 *               device_name:
 *                 type: string
 *                 example: Điện thoại Samsung của Ông Năm
 *     responses:
 *       '201':
 *         description: Thiết lập thành công, trả về device_token.
 *       '400':
 *         description: Thiếu device_fingerprint.
 *       '403':
 *         description: Không phải chủ hộ.
 *       '404':
 *         description: Không tìm thấy thành viên.
 */
router.post(
  '/:familyId/members/:memberId/setup-device',
  requireAuth,
  requireFamilyContext(['OWNER']),
  familyController.setupDeviceLogin,
);

/**
 * @openapi
 * /api/family/{familyId}/members/{memberId}/revoke-device:
 *   delete:
 *     tags:
 *       - Quick Login
 *     summary: Thu hồi quyền đăng nhập nhanh
 *     description: Chủ hộ thu hồi quyền đăng nhập nhanh trên thiết bị của thành viên. Thiết bị sẽ không còn tự động đăng nhập được.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Thu hồi thành công.
 *       '403':
 *         description: Không phải chủ hộ.
 *       '404':
 *         description: Không tìm thấy thành viên.
 */
router.delete(
  '/:familyId/members/:memberId/revoke-device',
  requireAuth,
  requireFamilyContext(['OWNER']),
  familyController.revokeDeviceLogin,
);

/**
 * @openapi
 * /api/family/{familyId}/devices:
 *   get:
 *     tags:
 *       - Quick Login
 *     summary: Xem danh sách thiết bị đã thiết lập đăng nhập nhanh
 *     description: Chủ hộ xem tất cả thiết bị đã được gán quick-login trong gia đình.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Danh sách thiết bị.
 *       '403':
 *         description: Không phải chủ hộ.
 */
router.get(
  '/:familyId/devices',
  requireAuth,
  requireFamilyContext(['OWNER']),
  familyController.getFamilyDevices,
);

/**
 * @openapi
 * /api/family/sos:
 *   post:
 *     tags:
 *       - Family
 *     summary: Phát tín hiệu cầu cứu SOS
 *     description: Gửi thông báo khẩn cấp tới tất cả thành viên trong các gia đình mà người dùng tham gia.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               latitude:
 *                 type: number
 *                 description: Vĩ độ hiện tại
 *               longitude:
 *                 type: number
 *                 description: Kinh độ hiện tại
 *     responses:
 *       '200':
 *         description: Đã phát tín hiệu SOS thành công
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Lỗi máy chủ
 */
router.post('/sos', requireAuth, familyController.sendSOS);

router.use('/:familyId/members/:memberId/medications', medicationRoutes);

// Tách
router.use('/members/:memberId/health', healthRoutes);

export default router;
