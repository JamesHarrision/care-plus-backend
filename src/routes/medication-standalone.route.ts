import { Router } from 'express';
import { confirmTaken } from '../controllers/medication.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @openapi
 * /api/medications/{id}/confirm-taken:
 *   post:
 *     tags:
 *       - Medication
 *     summary: Confirm medication taken
 *     description: Confirms that a medication schedule has been taken by the logged-in user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Medication schedule ID
 *     responses:
 *       '200':
 *         description: Medication taken successfully confirmed.
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
 *                 message: Xác nhận uống thuốc thành công
 *       '400':
 *         description: Bad request (e.g. invalid ID).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: Lịch uống thuốc không tồn tại
 *       '401':
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: Unauthorized
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
router.post('/:id/confirm-taken', requireAuth, confirmTaken);

export default router;
