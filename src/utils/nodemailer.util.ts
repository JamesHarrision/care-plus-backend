import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT as string),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (
  to: string,
  subject: string,
  html?: string
) => {
  try {
    await transporter.sendMail({
      from: `"Care+ System" <${process.env.SMTP_USER}>`,
      to: to,
      subject: subject,
      html: html
    })
    console.log(`Email sent to ${to}`);
  } catch (error: any) {
    console.error(`Failed to send email to ${to}`, error);
    throw new Error('Không thể gửi email OTP');
  }
}