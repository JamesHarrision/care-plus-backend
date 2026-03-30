import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

const ERROR_MAP: Record<string, { status: number; message: string }> = {
  EMAIL_OR_PHONE_EXISTS: { status: 409, message: 'Số điện thoại hoặc Email đã được sử dụng' },
  OTP_EXPIRED: { status: 400, message: 'Mã OTP đã hết hạn hoặc không tồn tại' },
  OTP_INVALID: { status: 400, message: 'Mã OTP không chính xác' },
  USER_NOT_FOUND: { status: 404, message: 'Không tìm thấy tài khoản' },
  ALREADY_ACTIVE: { status: 400, message: 'Tài khoản đã được kích hoạt từ trước' },
  ACCOUNT_NOT_ACTIVE: { status: 403, message: 'Tài khoản chưa được kích hoạt. Vui lòng xác thực email.' },
  WRONG_PASSWORD: { status: 401, message: 'Mật khẩu không chính xác' },
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
  }

  public verifyEmail = async (req: Request, res: Response) => {
    try {
      const { email, otp } = req.body;
      await authService.verifyEmail(email, otp);
      res.status(200).json({ status: 'success', data: { message: 'Xác thực tài khoản thành công' } });
    } catch (error) {
      handleError(res, error);
    }
  }

  public resendVerify = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      await authService.resendVerify(email);
      res.status(200).json({ status: 'success', data: { message: 'Đã gửi lại mã OTP. Vui lòng kiểm tra email.' } });
    } catch (error) {
      handleError(res, error);
    }
  }

  public login = async (req: Request, res: Response) => {
    try {
      const { identifier, password } = req.body;
      const result = await authService.login(identifier, password);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      handleError(res, error);
    }
  }
}