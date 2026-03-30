import { SystemRole } from "@prisma/client";
import { authRepository } from "../repositories/auth.repository";
import { JwtPayLoad } from "../interfaces/interfaces";
import { TokenUtil } from "../utils/JwtToken.util";

export const authService = {
  async verifyToken(token: string): Promise<JwtPayLoad> {
    const isBlacklisted = await authRepository.getBlackList(token);
    if (isBlacklisted) {
      throw new Error('TOKEN_BLACKLISTED');
    };

    const decoded = TokenUtil.verifyAccessToken(token) as JwtPayLoad;
    return decoded;
  },

  checkSystemRole(userRole: SystemRole, allowedRole: SystemRole[]): boolean {
    return allowedRole.includes(userRole);
  },

  async checkFamilyRole(
    familyId: string,
    userId: string,
    allowedRoles: ("MEMBER" | "OWNER")[]
  ) {
    const member = await authRepository.findFamilyMember(familyId, userId);

    if (!member) {
      throw new Error('NOT_FAMILY_MEMBER');
    }

    if (!allowedRoles.includes(member.family_role)) {
      throw new Error('INSUFFICIENT_FAMILY_ROLE');
    }

    return member;
  }
}