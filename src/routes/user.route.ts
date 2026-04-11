import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { AuthRequest } from '../interfaces/interfaces';
import { userRepository } from '../repositories/user.repository';
const router = Router();

/**
 * @openapi
 * /api/user/me:
 *   get:
 *     tags:
 *       - User
 *     summary: Get current user
 *     description: Returns the authenticated user's id and system role.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Authenticated user fetched successfully.
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
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     role:
 *                       type: string
 *                       enum:
 *                         - ADMIN
 *                         - USER
 *             example:
 *               status: success
 *               data:
 *                 id: 6f2d0c6a-7d1f-4bc3-9a80-1ed1fd5b3333
 *                 role: USER
 *       '401':
 *         description: Missing or invalid access token.
 *       '404':
 *         description: User account not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *             example:
 *               status: error
 *               message: Không tồn tại người dùng.
 *       '500':
 *         description: Internal server error.
 */
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const user = req.user;
  // Chỉ check nếu user tồn tại, vì requireAuth đã đảm bảo điều này. Dùng ở file entry

  const account = await userRepository.findById(req.user?.id as string);
  if (!account) {
    return res.status(404).json({ status: 'error', message: 'Không tồn tại người dùng.' });
  }
  return res.status(200).json({ status: 'success', data: { ...user } });
});

export default router;
