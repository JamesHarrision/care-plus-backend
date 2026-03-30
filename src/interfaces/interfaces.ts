import { Request } from "express";
import { SystemRole, FamilyRole } from "@prisma/client";

export interface JwtPayLoad {
  userId: string,
  systemRole: SystemRole
}

export interface AuthRequest extends Request {
  user?: {
    id: string,
    role: SystemRole
  },
  familyRole?: FamilyRole
}

