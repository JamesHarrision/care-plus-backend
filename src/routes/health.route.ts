import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { healthRecordController } from '../controllers/health-record.controller';

const router = Router({ mergeParams: true });

/**
 * @openapi
 * /api/family/members/{memberId}/health:
 *   get:
 *     tags:
 *       - HealthRecords
 *     summary: Get health records
 *     description: Retrieve health records for a specific family member. Can filter by date or type.
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *                     - records
 *                   properties:
 *                     records:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/HealthRecord'
 *             example:
 *               status: success
 *               data:
 *                 records:
 *                   - _id: 66d1f4f0d6c2a011d4f90e21
 *                     family_member_id: 2b9e8d1b-9b0f-4e7f-9dd0-5b3d7f9af7a1
 *                     updated_by_user_id: 7b8a0b11-4d27-4b17-9b91-0fd05b26d301
 *                     type: blood_pressure
 *                     value:
 *                       systolic: 120
 *                       diastolic: 80
 *                     unit: mmHg
 *                     note: Đo sau khi ăn
 *                     recorded_at: '2026-04-16T08:00:00.000Z'
 *                     created_at: '2026-04-16T08:01:00.000Z'
 *                     updated_at: '2026-04-16T08:01:00.000Z'
 *       '401':
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: Token không hợp lệ hoặc đã hết hạn
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
router.get('/', requireAuth, healthRecordController.getHealthRecords);

/**
 * @openapi
 * /api/family/members/{memberId}/health:
 *   post:
 *     tags:
 *       - HealthRecords
 *     summary: Create a health record
 *     description: Add a new health record for a family member.
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *                 additionalProperties: true
 *                 example:
 *                   systolic: 120
 *                   diastolic: 80
 *               unit:
 *                 type: string
 *                 example: mmHg
 *               note:
 *                 type: string
 *                 example: Đo sau khi ăn
 *               recorded_at:
 *                 type: string
 *                 format: date-time
 *             example:
 *               type: blood_pressure
 *               value:
 *                 systolic: 120
 *                 diastolic: 80
 *               unit: mmHg
 *               note: Đo sau khi ăn
 *               recorded_at: '2026-04-16T08:00:00.000Z'
 *     responses:
 *       '201':
 *         description: Successfully created record.
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
 *                     - record
 *                   properties:
 *                     record:
 *                       $ref: '#/components/schemas/HealthRecord'
 *             example:
 *               status: success
 *               data:
 *                 record:
 *                   _id: 66d1f4f0d6c2a011d4f90e22
 *                   family_member_id: 2b9e8d1b-9b0f-4e7f-9dd0-5b3d7f9af7a1
 *                   updated_by_user_id: 7b8a0b11-4d27-4b17-9b91-0fd05b26d301
 *                   type: blood_pressure
 *                   value:
 *                     systolic: 120
 *                     diastolic: 80
 *                   unit: mmHg
 *                   note: Đo sau khi ăn
 *                   recorded_at: '2026-04-16T08:00:00.000Z'
 *                   created_at: '2026-04-16T08:01:00.000Z'
 *                   updated_at: '2026-04-16T08:01:00.000Z'
 *       '400':
 *         description: Missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: 'Thiếu thông tin bắt buộc: type, value, unit'
 *       '401':
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: Token không hợp lệ hoặc đã hết hạn
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
router.post('/', requireAuth, healthRecordController.createHealthRecord);

/**
 * @openapi
 * /api/family/members/{memberId}/health/{recordId}:
 *   patch:
 *     tags:
 *       - HealthRecords
 *     summary: Update a health record
 *     description: Update an existing health record.
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *                     - record
 *                   properties:
 *                     record:
 *                       $ref: '#/components/schemas/HealthRecord'
 *             example:
 *               status: success
 *               data:
 *                 record:
 *                   _id: 66d1f4f0d6c2a011d4f90e22
 *                   family_member_id: 2b9e8d1b-9b0f-4e7f-9dd0-5b3d7f9af7a1
 *                   updated_by_user_id: 7b8a0b11-4d27-4b17-9b91-0fd05b26d301
 *                   type: blood_pressure
 *                   value:
 *                     systolic: 122
 *                     diastolic: 82
 *                   unit: mmHg
 *                   note: Đã cập nhật
 *                   recorded_at: '2026-04-16T08:00:00.000Z'
 *                   created_at: '2026-04-16T08:01:00.000Z'
 *                   updated_at: '2026-04-16T08:05:00.000Z'
 *       '401':
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: Token không hợp lệ hoặc đã hết hạn
 *       '404':
 *         description: Record not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: Không tìm thấy bản ghi
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: Lỗi máy chủ
 *   delete:
 *     tags:
 *       - HealthRecords
 *     summary: Delete a health record
 *     description: Delete a health record.
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *                 message: Xóa chỉ số thành công
 *       '401':
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: Token không hợp lệ hoặc đã hết hạn
 *       '404':
 *         description: Record not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: Không tìm thấy bản ghi
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
router.patch('/:recordId', requireAuth, healthRecordController.updateHealthRecord);

router.delete('/:recordId', requireAuth, healthRecordController.deleteHealthRecord);

export default router;
