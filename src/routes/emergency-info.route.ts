import { Router } from "express";
import { emergencyInfoController } from "../controllers/emergency-info.controller";
import { requireAuth } from "../middlewares/auth.middleware";

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
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               blood_type:
 *                 type: string
 *                 enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *                 example: O+
 *               allergies:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Penicillin", "Tôm"]
 *               chronic_diseases:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Tiểu đường type 2"]
 *               emergency_contacts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Nguyễn Văn B
 *                     phone:
 *                       type: string
 *                       example: "0912345678"
 *                     relationship:
 *                       type: string
 *                       example: Anh trai
 *               current_medications:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Metformin", "Vitamin C"]
 *               notes:
 *                 type: string
 *                 example: Dị ứng mạnh với hải sản
 *     responses:
 *       '200':
 *         description: Emergency info upserted successfully.
 *       '401':
 *         description: Missing or invalid access token.
 *       '500':
 *         description: Internal server error.
 */
router.put("/emergency-info", requireAuth, emergencyInfoController.upsertEmergencyInfo);

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
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     qrCodeUrl:
 *                       type: string
 *                       example: data:image/png;base64,...
 *                     quickAccessUrl:
 *                       type: string
 *                       example: https://careplus.app/user/quick/123e4567-e89b-12d3-a456-426614174000
 *       '401':
 *         description: Missing or invalid access token.
 *       '404':
 *         description: Emergency info does not exist yet.
 *       '500':
 *         description: Internal server error.
 */
router.get("/emergency-info/qr", requireAuth, emergencyInfoController.getEmergencyInfoQr);

/**
 * @openapi
 * /api/user/quick/{publicId}:
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
 *               type: object
 *               properties:
 *                 full_name:
 *                   type: string
 *                   example: Nguyễn Văn A
 *                 blood_type:
 *                   type: string
 *                   nullable: true
 *                   example: A+
 *                 allergies:
 *                   type: array
 *                   items:
 *                     type: string
 *                 chronic_diseases:
 *                   type: array
 *                   items:
 *                     type: string
 *                 emergency_contacts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       relationship:
 *                         type: string
 *                 current_medications:
 *                   type: array
 *                   items:
 *                     type: string
 *       '404':
 *         description: Public id hết hạn hoặc không tồn tại.
 */
router.get("/quick/:publicId", emergencyInfoController.getPublicEmergencyInfo);

export default router;
