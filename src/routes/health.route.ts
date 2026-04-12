import { Router } from "express";
import { requireAuth, requireFamilyContext } from "../middlewares/auth.middleware";
import { healthRecordController } from "../controllers/health-record.controller";

const router = Router({ mergeParams: true });

/**
 * @openapi
 * /api/family/{familyId}/members/{memberId}/health:
 *   get:
 *     tags:
 *       - HealthRecords
 *     summary: Get health records
 *     description: Retrieve health records for a specific family member. Can filter by date or type.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Family identifier (UUID)
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: Member identifier (UUID)
 *       - in: query
 *         name: date
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by date (YYYY-MM-DD)
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by record type (e.g., blood_pressure, blood_sugar, weight)
 *     responses:
 *       '200':
 *         description: Successfully retrieved records.
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden (not part of family).
 *       '500':
 *         description: Internal server error.
 */
router.get('/', requireAuth, requireFamilyContext(['OWNER', 'MEMBER']), healthRecordController.getHealthRecords);

/**
 * @openapi
 * /api/family/{familyId}/members/{memberId}/health:
 *   post:
 *     tags:
 *       - HealthRecords
 *     summary: Create a health record
 *     description: Add a new health record for a family member.
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
 *         description: Member identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - value
 *               - unit
 *             properties:
 *               type:
 *                 type: string
 *                 example: blood_pressure
 *               value:
 *                 type: object
 *                 example: { "systolic": 120, "diastolic": 80 }
 *               unit:
 *                 type: string
 *                 example: mmHg
 *               note:
 *                 type: string
 *                 example: Đo sau khi ăn
 *               recorded_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       '201':
 *         description: Successfully created record.
 *       '400':
 *         description: Missing required fields.
 *       '500':
 *         description: Internal server error.
 */
router.post('/', requireAuth, requireFamilyContext(['OWNER', 'MEMBER']), healthRecordController.createHealthRecord);

/**
 * @openapi
 * /api/family/{familyId}/members/{memberId}/health/{recordId}:
 *   patch:
 *     tags:
 *       - HealthRecords
 *     summary: Update a health record
 *     description: Update an existing health record. Members can only update records created today. Owner can update anytime.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: string
 *           description: MongoDB ObjectId
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: object
 *               unit:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successfully updated record.
 *       '403':
 *         description: Forbidden (cannot edit past records if not owner).
 *       '404':
 *         description: Record not found.
 */
router.patch('/:recordId', requireAuth, requireFamilyContext(['OWNER', 'MEMBER']), healthRecordController.updateHealthRecord);

/**
 * @openapi
 * /api/family/{familyId}/members/{memberId}/health/{recordId}:
 *   delete:
 *     tags:
 *       - HealthRecords
 *     summary: Delete a health record
 *     description: Delete a health record. Only the OWNER of the family context can perform this action.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully deleted.
 *       '403':
 *         description: Forbidden (OWNER only).
 *       '404':
 *         description: Record not found.
 */
router.delete('/:recordId', requireAuth, requireFamilyContext(['OWNER']), healthRecordController.deleteHealthRecord);

export default router;