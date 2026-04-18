import { Request, Response } from 'express';
import { AuthRequest } from '../interfaces/interfaces';
import { authService } from '../services/auth.service';

const ERROR_MAP: Record<string, { status: number; message: string }> = {
  EMAIL_OR_PHONE_EXISTS: { status: 409, message: 'Số điện thoại hoặc Email đã được sử dụng' },
  OTP_EXPIRED: { status: 400, message: 'Mã OTP đã hết hạn hoặc không tồn tại' },
  OTP_INVALID: { status: 400, message: 'Mã OTP không chính xác' },
  USER_NOT_FOUND: { status: 404, message: 'Không tìm thấy tài khoản' },
  ALREADY_ACTIVE: { status: 400, message: 'Tài khoản đã được kích hoạt từ trước' },
  ACCOUNT_NOT_ACTIVE: { status: 403, message: 'Tài khoản chưa được kích hoạt. Vui lòng xác thực email.' },
  WRONG_PASSWORD: { status: 401, message: 'Mật khẩu không chính xác' },

  INVALID_REFRESH_TOKEN: {
    status: 401,
    message: 'Refresh Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.',
  },
  USER_UNAVAILABLE: { status: 401, message: 'Tài khoản không khả dụng' },
  WRONG_OLD_PASSWORD: { status: 400, message: 'Mật khẩu cũ không chính xác' },
  NO_TOKEN_PROVIDED: { status: 401, message: 'Không tìm thấy token trong header' },
  TOKEN_BLACKLISTED: { status: 401, message: 'Token đã bị vô hiệu hóa (Đăng xuất)' },

  // Quick Login errors
  DEVICE_NOT_REGISTERED: { status: 401, message: 'Thiết bị chưa được đăng ký đăng nhập nhanh' },
  INVALID_DEVICE_TOKEN: { status: 401, message: 'Mã đăng nhập thiết bị không hợp lệ' },
  DEVICE_REVOKED: { status: 401, message: 'Quyền đăng nhập trên thiết bị đã bị thu hồi' },
  MEMBER_NOT_FOUND: { status: 404, message: 'Không tìm thấy thành viên' },
  FAMILY_NOT_FOUND: { status: 404, message: 'Không tìm thấy gia đình' },
};

function handleError(res: Response, error: any) {
  const mapped = ERROR_MAP[error.message];
  if (mapped) {
    return res.status(mapped.status).json({ status: 'error', message: mapped.message });
  }
  console.error('[Auth Error]:', error);
  return res.status(500).json({ status: 'error', message: 'Lỗi máy chủ' });
}

export class AuthController {
  public register = async (req: Request, res: Response) => {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        status: 'success',
        data: { ...result, message: 'Đăng ký thành công. Vui lòng kiểm tra email để nhận mã OTP.' },
      });
    } catch (error: any) {
      handleError(res, error);
    }
  };

  public verifyEmail = async (req: Request, res: Response) => {
    try {
      const { email, otp } = req.body;
      const result = await authService.verifyEmail(email, otp);
      // console.log(result);
      res.status(200).json({ status: 'success', data: { message: 'Xác thực tài khoản thành công', data: result } });
    } catch (error) {
      handleError(res, error);
    }
  };

  public resendVerify = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      await authService.resendVerify(email);
      res.status(200).json({ status: 'success', data: { message: 'Đã gửi lại mã OTP. Vui lòng kiểm tra email.' } });
    } catch (error) {
      handleError(res, error);
    }
  };

  // This endpoint is for users who just registered but didn't receive OTP, so they can login with email/phone and resend OTP if account is not active yet. This enhances UX by reducing friction to receive OTP.
  public resendVerifyByLogin = async (req: Request, res: Response) => {
    try {
      const { identifier } = req.body;
      const email = await authService.resendVerify(identifier);
      res.status(200).json({ status: 'success', email, data: { message: 'Đã gửi lại mã OTP.' } });
    } catch (error) {
      handleError(res, error);
    }
  };

  public login = async (req: Request, res: Response) => {
    try {
      // const token = TokenUtil.extractTokenFromHeader(req.headers.authorization);
      // const decoded = await authService.verifyToken(token);
      // if (decoded) {
      //   // res.status(200).json({ status: 'success', data: result });
      // }
      const { identifier, password } = req.body;
      const result = await authService.login(identifier, password);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      handleError(res, error);
    }
  };

  public refreshToken = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(refreshToken);
      res.status(200).json({ status: 'success', data: tokens });
    } catch (error: any) {
      handleError(res, error);
    }
  };

  public logout = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(400).json({ status: 'error', message: 'Không tìm thấy Access Token' });
      }

      const { device_fingerprint } = req.body;
      await authService.logout(token, device_fingerprint);
      res.status(200).json({ status: 'success', data: { message: 'Đăng xuất thành công' } });
    } catch (error: any) {
      handleError(res, error);
    }
  };

  public forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      res.status(200).json({
        status: 'success',
        data: { message: 'Khôi phục mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.' },
      });
    } catch (error) {
      handleError(res, error);
    }
  };

  public resetPassword = async (req: Request, res: Response) => {
    try {
      const { email, otp, newPassword } = req.body;
      await authService.resetPassword({
        email: email,
        otp: otp,
        newPassword: newPassword,
      });
      res.status(200).json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
      handleError(res, error);
    }
  };

  public changePassword = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'Không thể xác thực danh tính người dùng' });
      }
      await authService.changePassword(userId, req.body);
      res.status(200).json({ status: 'success', data: { message: 'Đổi mật khẩu thành công' } });
    } catch (error) {
      handleError(res, error);
    }
  };

  // =============== Quick Login (Device-Bound) ===============

  public quickLoginByDevice = async (req: Request, res: Response) => {
    try {
      const { device_token, device_fingerprint } = req.body;
      if (!device_token || !device_fingerprint) {
        return res.status(400).json({ status: 'error', message: 'Thiếu device_token hoặc device_fingerprint' });
      }
      const result = await authService.quickLoginByDevice(device_token, device_fingerprint);
      res.status(200).json({ status: 'success', data: result });
    } catch (error: any) {
      handleError(res, error);
    }
  };

  public refreshQuickLoginToken = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshQuickLoginToken(refreshToken);
      res.status(200).json({ status: 'success', data: tokens });
    } catch (error: any) {
      handleError(res, error);
    }
  };
}
