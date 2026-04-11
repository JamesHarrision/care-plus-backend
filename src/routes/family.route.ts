import { Router } from "express";
import { FamilyController } from "../controllers/familyController";
import { requireAuth, requireFamilyContext, requireSystemRole } from "../middlewares/auth.middleware";
import medicationRoutes from "./medication.route";

const router = Router();
const familyController = new FamilyController();

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

router.use("/:familyId/members/:memberId/medications", medicationRoutes)

export default router;
