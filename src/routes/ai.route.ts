import { Router } from 'express';
import { scanPrescription } from '../controllers/prescription.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

/**
 * @openapi
 * /api/ai/scan-prescription:
 *   post:
 *     tags:
 *       - AI
 *     summary: Scan prescription image
 *     description: Extracts medication details from a prescription image using AI.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The prescription image file (JPEG, PNG, etc.)
 *     responses:
 *       '200':
 *         description: Prescription scanned successfully.
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
 *                   $ref: '#/components/schemas/PrescriptionScanResponse'
 *             example:
 *               status: success
 *               data:
 *                 extracted:
 *                   - name: "Panadol Extra"
 *                     dosage: "1 viên"
 *                     frequency: "2 lần/ngày"
 *                     bin: "1001"
 *                     days: 5
 *                 confidence: 0.95
 *       '400':
 *         description: No image file provided.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: No image file provided
 *       '422':
 *         description: Cannot extract prescription from image.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: Không thể nhận diện toa thuốc từ ảnh
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
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: Internal Server Error
 */
router.post('/scan-prescription', requireAuth, upload.single('image'), scanPrescription);

export default router;
