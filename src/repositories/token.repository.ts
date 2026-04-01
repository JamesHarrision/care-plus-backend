import redisClient from "../config/redis.config";

export const tokenRepository = {
  async blacklistToken(token: string, ttlSeconds: number) {
    return redisClient.set(`blacklist:${token}`, 'true', { EX: ttlSeconds });
  },

  async getBlackList(token: string): Promise<string | null> {
    return redisClient.get(`blacklist:${token}`);
  },
}