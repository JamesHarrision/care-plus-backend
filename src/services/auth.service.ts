import { SystemRole } from "@prisma/client";
import { authRepository } from "../repositories/auth.repository";
import { JwtPayLoad } from "../interfaces/interfaces";
import { TokenUtil } from "../utils/JwtToken.util";
import { passwordUtil } from "../utils/password.util";
import { mailService } from "./mail.service";
import { mailRepository } from "../repositories/mail.repository";

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
  },

  async register(data: {
    full_name: string,
    phone: string,
    email: string,
    password: string
  }) {
    const { full_name, phone, email, password } = data;

    const existing = await authRepository.existsByEmailOrPhone(phone, email);
    if (existing) {
      throw new Error('EMAIL_OR_PHONE_EXISTS');
    }

    const password_hash = await passwordUtil.hashPassword(password);
    const newUser = await authRepository.createUser({
      full_name: full_name,
      email: email,
      password_hash: password_hash,
      phone: phone
    });

    if (email) {
      await mailService.sendVerificationOTP(email);
    }

    return { userId: newUser.id }
  },

  async verifyEmail(email: string, otp: string) {
    const storedOtp = await mailRepository.getOtp(email);

    if (!storedOtp) throw new Error('OTP_EXPIRED');
    if (storedOtp !== otp) throw new Error('OTP_INVALID');

    await authRepository.activateUser(email);
    await mailRepository.deleteOtp(email);
  },

  async resendVerify(email: string) {
    const user = await authRepository.findByEmail(email);

    if (!user) throw new Error('USER_NOT_FOUND');
    if (user.is_active) throw new Error('ALREADY_ACTIVE');

    await mailService.sendVerificationOTP(email);
  },

  async login(identifier: string, password: string) {
    const user = await authRepository.findByEmailOrPhone(identifier);

    if (!user) throw new Error('USER_NOT_FOUND');
    if (!user.is_active) throw new Error('ACCOUNT_NOT_ACTIVE');

    const isValid = await passwordUtil.comparePassword(password, user.password_hash);
    if (!isValid) throw new Error('WRONG_PASSWORD');

    // const tokens = generateTokens(user.id, user.system_role);
    const tokens = {
      accessToken: TokenUtil.signAccessToken({ userId: user.id, systemRole: user.system_role }),
      refreshToken: TokenUtil.signRefreshToken({ userId: user.id })
    }

    return {
      user: {
        id: user.id,
        full_name: user.full_name,
        system_role: user.system_role,
      },
      tokens,
    };
  }

}