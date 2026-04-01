import { SystemRole } from "@prisma/client";
import { JwtPayLoad } from "../interfaces/interfaces";
import { TokenUtil } from "../utils/JwtToken.util";
import { passwordUtil } from "../utils/password.util";
import { mailService } from "./mail.service";
import { userRepository } from "../repositories/user.repository";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/nodemailer.util";
import { tokenRepository } from "../repositories/token.repository";
import { familyRepository } from "../repositories/family.repository";
import { otpRepository } from "../repositories/otp.repository";

export const authService = {
  // Helpers
  async verifyToken(token: string): Promise<JwtPayLoad> {
    const isBlacklisted = await tokenRepository.getBlackList(token);
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
    const member = await familyRepository.findFamilyMember(familyId, userId);

    if (!member) {
      throw new Error('NOT_FAMILY_MEMBER');
    }

    if (!allowedRoles.includes(member.family_role)) {
      throw new Error('INSUFFICIENT_FAMILY_ROLE');
    }

    return member;
  },

  // Main services:
  async register(data: {
    full_name: string,
    phone: string,
    email: string,
    password: string
  }) {
    const { full_name, phone, email, password } = data;

    const existing = await userRepository.existsByEmailOrPhone(phone, email);
    if (existing) {
      throw new Error('EMAIL_OR_PHONE_EXISTS');
    }

    const password_hash = await passwordUtil.hashPassword(password);
    const newUser = await userRepository.createUser({
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
    const storedOtp = await otpRepository.getOtp(email);

    if (!storedOtp) throw new Error('OTP_EXPIRED');
    if (storedOtp !== otp) throw new Error('OTP_INVALID');

    await userRepository.activateUser(email);
    await otpRepository.deleteOtp(email);
  },

  async resendVerify(email: string) {
    const user = await userRepository.findByEmail(email);

    if (!user) throw new Error('USER_NOT_FOUND');
    if (user.is_active) throw new Error('ALREADY_ACTIVE');

    await mailService.sendVerificationOTP(email);
  },

  async login(identifier: string, password: string) {
    const user = await userRepository.findByEmailOrPhone(identifier);

    if (!user) throw new Error('USER_NOT_FOUND');
    if (!user.is_active) throw new Error('ACCOUNT_NOT_ACTIVE');

    const isValid = await passwordUtil.comparePassword(password, user.password_hash);
    if (!isValid) throw new Error('WRONG_PASSWORD');

    const tokens = TokenUtil.generateToken(
      { userId: user.id, systemRole: user.system_role } as JwtPayLoad
    );

    return {
      user: {
        id: user.id,
        full_name: user.full_name,
        system_role: user.system_role,
      },
      tokens,
    };
  },

  async refreshToken(refreshToken: string) {
    let decoded: JwtPayLoad;
    try {
      decoded = TokenUtil.verifyRefreshToken(refreshToken);
    } catch (error: any) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    const user = await userRepository.findById(decoded.userId);
    if (!user || !user.is_active) {
      throw new Error('USER_UNAVAILABLE');
    }

    return TokenUtil.generateToken(decoded);
  },

  async logout(accessToken: string) {
    const decoded = jwt.decode(accessToken) as jwt.JwtPayload;
    if (decoded?.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await tokenRepository.blacklistToken(accessToken, ttl);
      }
    }
  },

  async forgotPassword(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error('USER_NOT_FOUND');

    const otp = mailService.generateOTP();
    await otpRepository.savePasswordResetOTP(email, otp, 300);

    const text = `Mã xác nhận khôi phục mật khẩu Care+ của bạn là: ${otp}. Mã này sẽ hết hạn trong 5 phút.`;
    await sendEmail(email, 'Khôi phục mật khẩu Care+', text);
  },

  async resetPassword(
    data: {
      email: string,
      otp: string,
      newPassword: string
    }
  ) {
    const { email, otp, newPassword } = data;
    const storedOtp = await otpRepository.getPasswordResetOTP(email);

    if (!storedOtp) throw new Error('OTP_EXPIRED');
    if (storedOtp !== otp) throw new Error('OTP_INVALID');

    const password_hash = await passwordUtil.hashPassword(newPassword);
    await otpRepository.deletePasswordResetOTP(email);
    await userRepository.updatePasswordByEmail(email, password_hash);
  },

  async changePassword(
    userId: string,
    data: {
      oldPassword: string,
      newPassword: string
    }
  ) {
    const { oldPassword, newPassword } = data;

    const user = await userRepository.findById(userId);
    if (!user) throw new Error('USER_NOT_FOUND');

    const isValid = await passwordUtil.comparePassword(oldPassword, user.password_hash);
    if (!isValid) throw new Error('WRONG_OLD_PASSWORD');

    const password = await passwordUtil.hashPassword(newPassword);
    await userRepository.updatePasswordById(userId, password);
  }

}