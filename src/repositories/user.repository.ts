import { prisma } from '../config/prisma.config';

export const userRepository = {
  async findById(id: string, familyProjection = false) {
    return prisma.user.findUnique({
      where: { id },
      include: familyProjection
        ? {
            familyMembers: {
              select: {
                family_id: true,
                family_role: true,
                family_relation: true,
                family: true,
              },
            },
          }
        : {},
    });
  },

  async updatePasswordByEmail(email: string, password_hash: string) {
    return await prisma.user.update({
      where: { email: email },
      data: { password_hash },
    });
  },

  async updatePasswordById(id: string, password_hash: string) {
    return await prisma.user.update({
      where: { id: id },
      data: { password_hash },
    });
  },

  async findByEmailOrPhone(identifier: string) {
    return await prisma.user.findFirst({
      where: {
        OR: [{ phone: identifier }, { email: identifier }],
      },
    });
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async existsByEmailOrPhone(phone: string, email: string) {
    return prisma.user.findFirst({
      where: { OR: [{ phone }, { email }] },
    });
  },

  async createUser(data: { full_name: string; phone: string; email: string; password_hash: string }) {
    return prisma.user.create({
      data: { ...data, is_active: false },
    });
  },

  async activateUser(email: string) {
    return prisma.user.update({
      where: { email },
      data: { is_active: true },
      // When activating, we also want to return the user's id and role for token generation -> enhance UX
      select: { id: true, system_role: true, full_name: true },
    });
  },
};
