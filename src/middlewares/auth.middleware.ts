import { NextFunction, Request, Response } from "express";
import { SystemRole } from "@prisma/client";
import { authService } from "../services/auth.service";
import { AuthRequest } from "../interfaces/interfaces";
import { TokenUtil } from "../utils/JwtToken.util";

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ status: 'error', message: 'Không tìm thấy Access Token' });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await authService.verifyToken(token);

    req.user = {
      id: decoded.userId,
      role: decoded.systemRole,
    };

    next()
  } catch (error: any) {
    const message =
      error.message === 'TOKEN_BLACKLISTED'
        ? 'Token đã bị vô hiệu hóa (Đăng xuất)'
        : 'Token không hợp lệ hoặc đã hết hạn';

    return res.status(401).json({ status: 'error', message });
  }
}

export const requireSystemRole = async (roles: SystemRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !authService.checkSystemRole(req.user.role, roles)) {
      return res.status(403).json({
        status: 'error',
        message: 'Bạn không có quyền truy cập tài nguyên này',
      });
    }
    next();
  }
}

export const requireFamilyContext = (allowedRoles: ('OWNER' | 'MEMBER')[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { familyId } = req.params;
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
  }
}