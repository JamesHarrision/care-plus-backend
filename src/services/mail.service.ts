import { otpRepository } from "../repositories/otp.repository";
import { sendEmail } from "../utils/nodemailer.util";

export const mailService = {
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  async sendVerificationOTP(email: string) {
    const otp = this.generateOTP();
    await otpRepository.saveOTP(email, otp, 300);
    const html = `
      <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f4f6f8; padding: 40px 0;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          
          <h2 style="text-align: center; color: #2c3e50; margin-bottom: 20px;">
            Xác thực tài khoản Care+
          </h2>

          <p style="font-size: 15px; color: #555; line-height: 1.6;">
            Xin chào 👋,
          </p>

          <p style="font-size: 15px; color: #555; line-height: 1.6;">
            Bạn vừa yêu cầu mã xác thực để đăng ký tài khoản trên <b>Care+</b>.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <span style="
              display: inline-block;
              font-size: 28px;
              letter-spacing: 6px;
              font-weight: bold;
              color: #ffffff;
              background: #4f46e5;
              padding: 14px 28px;
              border-radius: 8px;
            ">
              ${otp}
            </span>
          </div>

          <p style="font-size: 14px; color: #666; text-align: center;">
            Mã này sẽ hết hạn sau <b>5 phút</b> ⏱️
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />

          <p style="font-size: 13px; color: #999; text-align: center;">
            Nếu bạn không yêu cầu mã này, hãy bỏ qua email này.
          </p>

          <p style="font-size: 13px; color: #999; text-align: center; margin-top: 10px;">
            © Care+ Team
          </p>

        </div>
      </div>
      `;
    await sendEmail(email, 'Mã xác thực tài khoản Care+', html);
  }

}