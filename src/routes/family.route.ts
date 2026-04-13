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
 *     summary: Create a new family
 *     description: Creates a new family group with the current user as the owner.
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
 *                 example: My Family
 *               address:
 *                 type: string
 *                 example: 123 Main St
 *     responses:
 *       '201':
 *         description: Family created successfully.
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
 *                     family:
 *                       type: object
 *       '500':
 *         description: Internal Server Error.
 */
router.post("/", requireAuth, familyController.createFamily);

/**
 * @openapi
 * /api/family/my-families:
 *   get:
 *     tags:
 *       - Family
 *     summary: Get user's families
 *     description: Retrieves all families that the current user is a member of.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: List of families retrieved successfully.
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
 *                     families:
 *                       type: array
 *                       items:
 *                         type: object
 *       '401':
 *         description: Unauthorized.
 *       '500':
 *         description: Internal Server Error.
 */
router.get("/my-families", requireAuth, familyController.getUserFamilies);

/**
 * @openapi
 * /api/family/join:
 *   post:
 *     tags:
 *       - Family
 *     summary: Join a family
 *     description: Sends a request to join a family using an invite code.
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
 *                 example: ABCDEF
 *     responses:
 *       '200':
 *         description: Join request sent successfully.
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
 *                       example: Yêu cầu tham gia đã được gửi, chờ chủ nhà duyệt.
 *       '400':
 *         description: Invalid or expired invite code.
 *       '409':
 *         description: User is already a member or pending.
 *       '500':
 *         description: Internal Server Error.
 */
router.post("/join", requireAuth, familyController.joinFamily);

/**
 * @openapi
 * /api/family/{familyId}/generate-invite:
 *   post:
 *     tags:
 *       - Family
 *     summary: Generate invite code
 *     description: Generates a new 6-character invite code for the family. Only accessible by OWNER.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Family identifier
 *     responses:
 *       '200':
 *         description: Invite code generated successfully.
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
 *                     inviteCode:
 *                       type: string
 *                       example: GHIJKL
 *                     expiresIn:
 *                       type: number
 *                       example: 300
 *       '500':
 *         description: Internal Server Error.
 */
router.post('/:familyId/generate-invite',
  requireAuth,
  requireFamilyContext(["OWNER"]),
  familyController.generateInvite
);

/**
 * @openapi
 * /api/family/{familyId}/pending-members:
 *   get:
 *     tags:
 *       - Family
 *     summary: Get pending members
 *     description: Retrieves a list of users who have requested to join the family and are pending approval. Only accessible by OWNER.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Family identifier
 *     responses:
 *       '200':
 *         description: List of pending members retrieved successfully.
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
 *                     members:
 *                       type: array
 *                       items:
 *                         type: object
 *       '500':
 *         description: Internal Server Error.
 */
router.get("/:familyId/pending-members",
  requireAuth,
  requireFamilyContext(["OWNER"]),
  familyController.getPendingMember
)

/**
 * @openapi
 * /api/family/{familyId}/members/{memberId}/status:
 *   patch:
 *     tags:
 *       - Family
 *     summary: Review join request
 *     description: Approves or rejects a request to join the family. Only accessible by OWNER.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Family identifier
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: Member identifier (request index)
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
 *                 enum: [APPROVED, REJECTED]
 *                 example: APPROVED
 *     responses:
 *       '200':
 *         description: Member status updated successfully.
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
 *                       example: Cập nhật trạng thái thành công
 *       '400':
 *         description: Member request not found.
 *       '500':
 *         description: Internal Server Error.
 */
router.patch("/:familyId/members/:memberId/status",
  requireAuth,
  requireFamilyContext(["OWNER"]),
  familyController.reviewJoinRequest
)

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
 *         description: Family identifier
 *     responses:
 *       '200':
 *         description: List of family members retrieved successfully.
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
 *                     members:
 *                       type: array
 *                       items:
 *                         type: object
 *       '403':
 *         description: Forbidden (Not a member of the family).
 *       '500':
 *         description: Internal Server Error.
 */
router.get("/:familyId/members",
  requireAuth,
  requireFamilyContext(["OWNER", "MEMBER"]),
  familyController.getFamilyMembers
)

router.use("/:familyId/members/:memberId/medications", medicationRoutes)

export default router;