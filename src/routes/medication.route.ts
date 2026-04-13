import { Router } from 'express';
import { createMedicationSchedule, getMedicationsByMember, updateMedicationSchedule, deleteMedicationSchedule } from '../controllers/medication.controller';
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

/**
 * @openapi
 * /api/family/{familyId}/members/{memberId}/medications:
 *   get:
 *     tags:
 *       - Medication
 *     summary: Get medication schedules
 *     description: Retrieve all active medication schedules for a family member.
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
 *     responses:
 *       '200':
 *         description: Medication schedules retrieved successfully.
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
 *                     schedules:
 *                       type: array
 *                       items:
 *                         type: object
 *       '400':
 *         description: Missing required fields or bad request.
 *       '404':
 *         description: Family member not found.
 *       '500':
 *         description: Internal Server Error.
 */
router.get('/', requireAuth, requireFamilyContext(["OWNER", "MEMBER"]), getMedicationsByMember);

/**
 * @openapi
 * /api/family/{familyId}/members/{memberId}/medications/{id}:
 *   patch:
 *     tags:
 *       - Medication
 *     summary: Update a medication schedule
 *     description: Updates an existing medication schedule. Excludes family_id and family_member_id from changes.
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
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Medication schedule ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               medications:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       '200':
 *         description: Medication schedule updated successfully.
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
 *                     schedule:
 *                       type: object
 *       '400':
 *         description: Bad request (e.g. invalid ID or unauthorized).
 *       '500':
 *         description: Internal Server Error.
 */
router.patch('/:id', requireAuth, requireFamilyContext(["OWNER", "MEMBER"]), updateMedicationSchedule);

/**
 * @openapi
 * /api/family/{familyId}/members/{memberId}/medications/{id}:
 *   delete:
 *     tags:
 *       - Medication
 *     summary: Delete a medication schedule
 *     description: Soft deletes a medication schedule by setting is_active to false.
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
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Medication schedule ID
 *     responses:
 *       '200':
 *         description: Medication schedule deleted successfully.
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
 *                       example: Xóa lịch uống thuốc thành công
 *       '400':
 *         description: Bad request (e.g. invalid ID or unauthorized).
 *       '500':
 *         description: Internal Server Error.
 */
router.delete('/:id', requireAuth, requireFamilyContext(["OWNER", "MEMBER"]), deleteMedicationSchedule);

export default router;
