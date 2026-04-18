import { SystemRole } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { NextFunction, Response } from 'express';
import { AuthRequest } from '../interfaces/interfaces';
import { authService } from '../services/auth.service';
import { TokenUtil } from '../utils/JwtToken.util';
import { familyRepository } from '../repositories/family.repository';

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tokenHeader = req.headers.authorization;
    if (!tokenHeader) {
      return res.status(401).json({ status: 'error', message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    const token = TokenUtil.extractTokenFromHeader(tokenHeader);

    // Check blacklist
    const { getBlackList } = await import('../repositories/token.repository').then(m => m.tokenRepository);
    const isBlacklisted = await getBlackList(token);
    if (isBlacklisted) {
      return res.status(401).json({ status: 'error', message: 'Token đã bị vô hiệu hóa (Đăng xuất)' });
    }

    // Decode token to check loginType
    const rawDecoded = jwt.decode(token) as any;

    if (rawDecoded?.loginType === 'quick_login') {
      // Quick-login token → verify và set quickLoginMember
      const decoded = TokenUtil.verifyQuickLoginAccessToken(token);

      // Verify device còn tồn tại trong DB (Existence Check)
      if (!decoded.deviceId) {
        return res.status(401).json({ status: 'error', message: 'Phiên đăng nhập cũ không còn khả dụng, vui lòng đăng nhập lại' });
      }

      const device = await familyRepository.findDeviceById(decoded.deviceId);
      if (!device) {
        return res.status(401).json({ status: 'error', message: 'Quyền đăng nhập trên thiết bị đã bị thu hồi' });
      }

      req.quickLoginMember = {
        memberId: decoded.memberId,
        familyId: decoded.familyId,
        deviceId: decoded.deviceId,
      };
    } else {
      // Normal token → verify và set user (luồng hiện tại)
      const { valid, user } = await authService.checkValidAccessToken(tokenHeader);
      if (!valid || !user) {
        return res.status(401).json({ status: 'error', message: 'Token không hợp lệ hoặc đã hết hạn' });
      }
      req.user = user;
    }

    next();
  } catch (error: any) {
    const message =
      error.message === 'TOKEN_BLACKLISTED'
        ? 'Token đã bị vô hiệu hóa (Đăng xuất)'
        : 'Token không hợp lệ hoặc đã hết hạn';

    return res.status(401).json({ status: 'error', message });
  }
};

/**
 * Chặn quick-login member truy cập API yêu cầu tài khoản đầy đủ
 * Ví dụ: đổi mật khẩu, quản lý tài khoản, tạo gia đình mới...
 */
export const requireFullAccount = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.quickLoginMember) {
    return res.status(403).json({
      status: 'error',
      message: 'Tính năng này yêu cầu đăng nhập bằng tài khoản đầy đủ',
    });
  }
  if (!req.user) {
    return res.status(401).json({ status: 'error', message: 'Không thể xác thực danh tính người dùng' });
  }
  next();
};

export const requireSystemRole = async (roles: SystemRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !authService.checkSystemRole(req.user.role, roles)) {
      return res.status(403).json({
        status: 'error',
        message: 'Bạn không có quyền truy cập tài nguyên này',
      });
    }
    next();
  };
};

export const requireFamilyContext = (allowedRoles: ('OWNER' | 'MEMBER')[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { familyId } = req.params;

      // Hỗ trợ cả quick-login member và user thường
      if (req.quickLoginMember) {
        // Quick-login: chỉ cho phép truy cập family mà member thuộc về
        if (req.quickLoginMember.familyId !== familyId) {
          return res.status(403).json({
            status: 'error',
            message: 'Bạn không phải là thành viên của gia đình này',
          });
        }
        req.familyRole = 'MEMBER'; // Quick-login member luôn là MEMBER
        if (!allowedRoles.includes('MEMBER')) {
          return res.status(403).json({
            status: 'error',
            message: 'Quyền hạn trong gia đình không đủ',
          });
        }
        return next();
      }

      const userId = req.user?.id;

      if (!familyId || !userId) {
        return res.status(400).json({
          status: 'error',
          message: 'Thiếu thông tin Family ID hoặc User',
        });
      }

      const member = await authService.checkFamilyRole(familyId as string, userId, allowedRoles);
      req.familyRole = member.family_role;

      next();
    } catch (error: any) {
      const statusMap: Record<string, number> = {
        NOT_FAMILY_MEMBER: 403,
        INSUFFICIENT_FAMILY_ROLE: 403,
      };

      const messageMap: Record<string, string> = {
        NOT_FAMILY_MEMBER: 'Bạn không phải là thành viên của gia đình này',
        INSUFFICIENT_FAMILY_ROLE: 'Quyền hạn trong gia đình không đủ',
      };

      const status = statusMap[error.message] ?? 500;
      const message = messageMap[error.message] ?? 'Lỗi kiểm tra quyền gia đình';

      return res.status(status).json({ status: 'error', message });
    }
  };
};

/**
 * This checks:
 *
 * - User must be authenticated (have a valid access token) (already handled by requireAuth)
 *
 * - Chỉ cho phép thao tác các hoạt động nguy hiểm như xóa ..., khi:
 * + Nếu là chủ nhà
 * + Hoặc là người dùng cá nhân: không thuộc gia đình nào cả (tức là không có family context)
 *
 */
export const requireFamilyContextDanger = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Quick-login members không được phép thao tác nguy hiểm
  if (req.quickLoginMember) {
    return res.status(403).json({
      status: 'error',
      message: 'Bạn không có quyền thực hiện hành động này',
    });
  }

  // Lấy thông tin của user từ req.user
  const id = req.user?.id;
  // Kiểm tra trong bảng family_member xem user này có thuộc gia đình nào không
  const { membership, isOwner } = await familyRepository.hasFamily(id as string);
  if (membership && !isOwner) {
    return res.status(403).json({
      status: 'error',
      message: 'Bạn không có quyền thực hiện hành động này',
    });
  }
  return next();
};
