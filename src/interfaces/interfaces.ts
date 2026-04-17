import { Request } from "express";
import { SystemRole, FamilyRole } from "@prisma/client";

export interface JwtPayLoad {
  userId: string,
  systemRole: SystemRole
}

// JWT payload cho quick-login session (Device-Bound)
export interface QuickLoginPayload {
  memberId: string;
  familyId: string;
  loginType: 'quick_login';
}

export interface AuthRequest extends Request {
  user?: {
    id: string,
    role: SystemRole
  },
  familyRole?: FamilyRole,
  // Populated khi request đến từ quick-login member
  quickLoginMember?: {
    memberId: string;
    familyId: string;
  }
}

