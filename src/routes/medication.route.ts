import { Router } from 'express';
import {
  createMedicationSchedule,
  getMedicationsByMember,
  updateMedicationSchedule,
  deleteMedicationSchedule,
} from '../controllers/medication.controller';
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
 *                   $ref: '#/components/schemas/MedicationItem'
 *               session_times:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ['08:00', '12:00', '14:00', '20:00']
 *             example:
 *               start_date: '2026-04-13T00:00:00Z'
 *               end_date: '2026-04-18T00:00:00Z'
 *               session_times:
 *                 - '08:00'
 *                 - '12:00'
 *                 - '14:00'
 *                 - '20:00'
 *               medications:
 *                 - name: Panadol Extra
 *                   dosage: 1 viên
 *                   frequency: 2 lần/ngày
 *                   bin: '1001'
 *                   times:
 *                     - '08:00'
 *                     - '20:00'
 *                   days: 5
 *     responses:
 *       '201':
 *         description: Medication schedule created successfully.
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
 *                     - scheduleId
 *                     - reminderMessage
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: Missing required fields in body.
 *       '401':
 *         description: Missing or invalid access token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: Token không hợp lệ hoặc đã hết hạn
 *       '403':
 *         description: Forbidden by family context.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notFamilyMember:
 *                 value:
 *                   status: error
 *                   message: Bạn không phải là thành viên của gia đình này
 *               insufficientRole:
 *                 value:
 *                   status: error
 *                   message: Quyền hạn trong gia đình không đủ
 *       '404':
 *         description: Family member not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: Family member not found
 *       '500':
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: Internal Server Error
 */
router.post('/', requireAuth, requireFamilyContext(['OWNER', 'MEMBER']), createMedicationSchedule);

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
 *                     - schedules
 *                   properties:
 *                     schedules:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MedicationSchedule'
 *             example:
 *               status: success
 *               data:
 *                 schedules:
 *                   - _id: 651a2b3c4d5e6f7a8b9c0d1e
 *                     family_id: 8c8f0df7-1e1f-4e5f-8b98-f6f5d7c8f111
 *                     family_member_id: 2b9e8d1b-9b0f-4e7f-9dd0-5b3d7f9af7a1
 *                     medications:
 *                       - name: Panadol Extra
 *                         dosage: 1 viên
 *                         frequency: 2 lần/ngày
 *                         bin: '1001'
 *                         times:
 *                           - '08:00'
 *                           - '20:00'
 *                         days: 5
 *                     start_date: '2026-04-13T00:00:00.000Z'
 *                     end_date: '2026-04-18T00:00:00.000Z'
 *                     reminder_message: Đã đến giờ uống thuốc, bạn nhớ uống đúng giờ nhé!
 *                     is_active: true
 *                     session_times:
 *                       - '08:00'
 *                       - '12:00'
 *                       - '14:00'
 *                       - '20:00'
 *                     confirmed_by: null
 *                     created_at: '2026-04-13T08:00:00.000Z'
 *                     updated_at: '2026-04-13T08:00:00.000Z'
 *       '400':
 *         description: Missing required fields or bad request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: Missing required fields in body.
 *       '401':
 *         description: Missing or invalid access token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: Token không hợp lệ hoặc đã hết hạn
 *       '403':
 *         description: Forbidden by family context.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notFamilyMember:
 *                 value:
 *                   status: error
 *                   message: Bạn không phải là thành viên của gia đình này
 *               insufficientRole:
 *                 value:
 *                   status: error
 *                   message: Quyền hạn trong gia đình không đủ
 *       '404':
 *         description: Family member not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: Family member not found
 *       '500':
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: Internal Server Error
 */
router.get('/', requireAuth, requireFamilyContext(['OWNER', 'MEMBER']), getMedicationsByMember);

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
 *                   $ref: '#/components/schemas/MedicationItem'
 *     responses:
 *       '200':
 *         description: Medication schedule updated successfully.
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
 *                     - schedule
 *                   properties:
 *                     schedule:
 *                       $ref: '#/components/schemas/MedicationSchedule'
 *             example:
 *               status: success
 *               data:
 *                 schedule:
 *                   _id: 651a2b3c4d5e6f7a8b9c0d1e
 *                   family_id: 8c8f0df7-1e1f-4e5f-8b98-f6f5d7c8f111
 *                   family_member_id: 2b9e8d1b-9b0f-4e7f-9dd0-5b3d7f9af7a1
 *                   medications:
 *                     - name: Panadol Extra
 *                       dosage: 1 viên
 *                       frequency: 3 lần/ngày
 *                       bin: '1110'
 *                       times:
 *                         - '08:00'
 *                         - '12:00'
 *                         - '16:00'
 *                       days: 5
 *                   start_date: '2026-04-13T00:00:00.000Z'
 *                   end_date: '2026-04-18T00:00:00.000Z'
 *                   reminder_message: Đã đến giờ uống thuốc, bạn nhớ uống đúng giờ nhé!
 *                   is_active: true
 *                   session_times:
 *                     - '08:00'
 *                     - '12:00'
 *                     - '14:00'
 *                     - '20:00'
 *                   confirmed_by: null
 *                   created_at: '2026-04-13T08:00:00.000Z'
 *                   updated_at: '2026-04-13T09:00:00.000Z'
 *       '400':
 *         description: Bad request (e.g. invalid ID or unauthorized).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notFound:
 *                 value:
 *                   status: error
 *                   message: Lịch uống thuốc không tồn tại
 *               forbidden:
 *                 value:
 *                   status: error
 *                   message: Không có quyền sửa lịch uống thuốc này
 *       '401':
 *         description: Missing or invalid access token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: Token không hợp lệ hoặc đã hết hạn
 *       '403':
 *         description: Forbidden by family context.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: Internal Server Error
 */
router.patch('/:id', requireAuth, requireFamilyContext(['OWNER', 'MEMBER']), updateMedicationSchedule);

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
 *                 message: Xóa lịch uống thuốc thành công
 *       '400':
 *         description: Bad request (e.g. invalid ID or unauthorized).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notFound:
 *                 value:
 *                   status: error
 *                   message: Lịch uống thuốc không tồn tại
 *               forbidden:
 *                 value:
 *                   status: error
 *                   message: Không có quyền xóa lịch uống thuốc này
 *       '401':
 *         description: Missing or invalid access token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: Token không hợp lệ hoặc đã hết hạn
 *       '403':
 *         description: Forbidden by family context.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: Internal Server Error
 */
router.delete('/:id', requireAuth, requireFamilyContext(['OWNER', 'MEMBER']), deleteMedicationSchedule);

export default router;
