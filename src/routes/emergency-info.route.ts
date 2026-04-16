import { Router } from 'express';
import { emergencyInfoController } from '../controllers/emergency-info.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @openapi
 * /api/users/emergency-info:
 *   put:
 *     tags:
 *       - EmergencyInfo
 *     summary: Upsert emergency info
 *     description: Tạo mới hoặc cập nhật thông tin khẩn cấp của chính người dùng đang đăng nhập.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmergencyInfoUpsertInput'
 *           example:
 *             blood_type: O+
 *             allergies:
 *               - Penicillin
 *               - Tôm
 *             chronic_diseases:
 *               - Tiểu đường type 2
 *             emergency_contacts:
 *               - name: Nguyễn Văn B
 *                 phone: '0912345678'
 *                 relationship: Anh trai
 *             current_medications:
 *               - Metformin
 *               - Vitamin C
 *             notes: Dị ứng mạnh với hải sản
 *     responses:
 *       '200':
 *         description: Emergency info upserted successfully.
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
 *                     - emergencyInfo
 *                   properties:
 *                     emergencyInfo:
 *                       $ref: '#/components/schemas/EmergencyInfo'
 *             example:
 *               status: success
 *               data:
 *                 emergencyInfo:
 *                   user_id: 7b8a0b11-4d27-4b17-9b91-0fd05b26d301
 *                   blood_type: O+
 *                   allergies:
 *                     - Penicillin
 *                     - Tôm
 *                   chronic_diseases:
 *                     - Tiểu đường type 2
 *                   emergency_contacts:
 *                     - name: Nguyễn Văn B
 *                       phone: '0912345678'
 *                       relationship: Anh trai
 *                   current_medications:
 *                     - Metformin
 *                     - Vitamin C
 *                   notes: Dị ứng mạnh với hải sản
 *                   updated_at: '2026-04-16T08:00:00.000Z'
 *       '401':
 *         description: Missing or invalid access token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: Token không hợp lệ hoặc đã hết hạn
 *       '400':
 *         description: Emergency info validation failed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: Dữ liệu thông tin khẩn cấp không hợp lệ
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
router.put('/emergency-info', requireAuth, emergencyInfoController.upsertEmergencyInfo);

/**
 * @openapi
 * /api/users/emergency-info/qr:
 *   get:
 *     tags:
 *       - EmergencyInfo
 *     summary: Generate emergency info QR
 *     description: Sinh mã QR truy cập nhanh cho thông tin khẩn cấp của người dùng hiện tại.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: QR code generated successfully.
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
 *                   $ref: '#/components/schemas/QrCodeResponse'
 *             example:
 *               status: success
 *               data:
 *                 qrCodeUrl: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
 *                 quickAccessUrl: https://careplus.app/user/quick/123e4567-e89b-12d3-a456-426614174000
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
 *         description: Emergency info does not exist yet.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: Chưa có thông tin khẩn cấp
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
router.get('/emergency-info/qr', requireAuth, emergencyInfoController.getEmergencyInfoQr);

/**
 * @openapi
 * /api/users/quick/{publicId}:
 *   get:
 *     tags:
 *       - EmergencyInfo
 *     summary: Get public emergency info by QR public id
 *     description: Endpoint công khai cho nhân viên y tế tra cứu thông tin khẩn cấp từ QR, không cần đăng nhập.
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Public id lưu trong Redis với TTL 24 giờ.
 *     responses:
 *       '200':
 *         description: Emergency info found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublicEmergencyInfo'
 *             example:
 *               full_name: Nguyễn Văn A
 *               blood_type: A+
 *               allergies:
 *                 - Penicillin
 *                 - Tôm
 *               chronic_diseases:
 *                 - Tăng huyết áp
 *               emergency_contacts:
 *                 - name: Nguyễn Văn B
 *                   phone: '0912345678'
 *                   relationship: Anh trai
 *               current_medications:
 *                 - Metformin
 *                 - Vitamin C
 *       '404':
 *         description: Public id hết hạn hoặc không tồn tại.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: Không tìm thấy thông tin
 */
router.get('/quick/:publicId', emergencyInfoController.getPublicEmergencyInfo);

export default router;
