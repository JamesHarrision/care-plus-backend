import { Router } from 'express';
import { createMedicationSchedule } from '../controllers/medication.controller';
import { requireAuth, requireFamilyContext } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

/**
 * @openapi
 * /api/family/{familyId}/members/{memberId}/medications:
 *   post:
 *     tags:
 *       - Medication
 *     summary: Create a medication schedule
 *     description: Creates a new medication schedule for a family member and generates an AI reminder message.
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
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Family member identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - start_date
 *               - medications
 *             properties:
 *               start_date:
 *                 type: string
 *                 format: date-time
 *                 example: '2026-04-13T00:00:00Z'
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 example: '2026-04-18T00:00:00Z'
 *               medications:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     dosage:
 *                       type: string
 *                     frequency:
 *                       type: string
 *                     bin:
 *                       type: string
 *                       nullable: true
 *                     days:
 *                       type: number
 *                       nullable: true
 *             example:
 *               start_date: '2026-04-13T00:00:00Z'
 *               end_date: '2026-04-18T00:00:00Z'
 *               medications:
 *                 - name: "Panadol Extra"
 *                   dosage: "1 viên"
 *                   frequency: "2 lần/ngày"
 *                   bin: "1001"
 *                   days: 5
 *     responses:
 *       '201':
 *         description: Medication schedule created successfully.
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
 *                     scheduleId:
 *                       type: string
 *                     reminderMessage:
 *                       type: string
 *             example:
 *               status: success
 *               data:
 *                 scheduleId: "651a2b3c4d5e6f7a8b9c0d1e"
 *                 reminderMessage: "Đã đến giờ uống thuốc, bạn nhớ uống đúng giờ nhé!"
 *       '400':
 *         description: Missing required fields in body.
 *       '404':
 *         description: Family member not found.
 *       '500':
 *         description: Internal Server Error.
 */
router.post('/', requireAuth, requireFamilyContext(["OWNER", "MEMBER"]), createMedicationSchedule);

export default router;
