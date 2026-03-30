import redisClient from "../config/redis.config";
import { prisma } from "../config/prisma.config";

export const authRepository = {
  async getBlackList(token: string): Promise<string | null> {
    return redisClient.get(`blacklist:${token}`);
  },

  async findFamilyMember(familyId: string, userId: string) {
    return await prisma.familyMember.findUnique({
      where: {
        family_id_user_id: {
          family_id: familyId,
          user_id: userId
        }
      }
    })
  }
}