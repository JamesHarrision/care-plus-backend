import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { AuthRequest } from '../interfaces/interfaces';
import { userRepository } from '../repositories/user.repository';
const router = Router();
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const user = req.user;
  // Chỉ check nếu user tồn tại, vì requireAuth đã đảm bảo điều này. Dùng ở file entry

  const account = userRepository.findById(req.user?.id as string);
  if (!account) {
    return res.status(404).json({ status: 'error', message: 'Không tồn tại người dùng. ' });
  }
  return res.status(200).json({ status: 'success', data: { ...user } });
});

export default router;
