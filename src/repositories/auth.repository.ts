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
  },

  async findByEmailOrPhone(identifier: string) {
    return await prisma.user.findFirst({
      where: {
        OR: [
          { phone: identifier },
          { email: identifier }
        ]
      }
    })
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async existsByEmailOrPhone(phone: string, email: string) {
    return prisma.user.findFirst({
      where: { OR: [{ phone }, { email }] },
    });
  },

  async createUser(data: {
    full_name: string;
    phone: string;
    email: string;
    password_hash: string;
  }) {
    return prisma.user.create({
      data: { ...data, is_active: false },
    });
  },

  async activateUser(email: string) {
    return prisma.user.update({
      where: { email },
      data: { is_active: true },
    });
  },
}