import redisClient from "../config/redis.config";

export const mailRepository = {
  // --- OTP (Redis) ---
  async saveOTP(email: string, otp: string, ttlSeconds = 300) {
    return await redisClient.set(`otp:verify_email:${email}`, otp, { EX: ttlSeconds });
  },

  async getOtp(email: string): Promise<string | null> {
    return await redisClient.get(`otp:verify_email:${email}`);
  },

  async deleteOtp(email: string) {
    return await redisClient.del(`otp:verify_email:${email}`);
  },
}