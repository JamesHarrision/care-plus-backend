import { prisma } from '../config/prisma.config';
import { FamilyRole, JoinStatus, Prisma } from '@prisma/client';
import redisClient from '../config/redis.config';

export const familyRepository = {
  async findFamilyMember(familyId: string, userId: string) {
    return await prisma.familyMember.findUnique({
      where: {
        family_id_user_id: {
          family_id: familyId,
          user_id: userId,
        },
      },
    });
  },

  async createFamily(userId: string, name: string, address?: string) {
    return await prisma.$transaction(async (tx) => {
      const family = await tx.family.create({
        data: { name, address },
      });

      await tx.familyMember.create({
        data: {
          family_id: family.id,
          user_id: userId,
          family_role: 'OWNER',
          join_status: JoinStatus.APPROVED,
        },
      });

      return family;
    });
  },

  async saveInviteCode(familyId: string, code: string) {
    await redisClient.set(`family:invite:${code}`, familyId, { EX: 300 });
  },

  async getFamilyIdByInviteCode(code: string): Promise<string | null> {
    return await redisClient.get(`family:invite:${code}`);
  },

  async addPendingMember(familyId: string, userId: string) {
    return await prisma.familyMember.create({
      data: {
        family_id: familyId,
        user_id: userId,
        family_role: FamilyRole.MEMBER,
        join_status: JoinStatus.PENDING,
      },
    });
  },

  async getPendingMember(familyId: string) {
    return await prisma.familyMember.findMany({
      where: {
        family_id: familyId,
        join_status: JoinStatus.PENDING,
      },
      include: {
        user: {
          select: { id: true, full_name: true, email: true, phone: true },
        },
      },
    });
  },

  async updateMemberStatus(familyId: string, memberId: string, status: 'APPROVED' | 'REJECTED') {
    return await prisma.familyMember.updateMany({
      where: {
        family_id: familyId,
        user_id: memberId,
      },
      data: {
        join_status: status,
      },
    });
  },

  async getUserFamilies(userId: string) {
    return await prisma.familyMember.findMany({
      where: {
        user_id: userId,
        join_status: JoinStatus.APPROVED,
      },
      include: {
        family: true,
      },
    });
  },

  async getFamilyMembers(familyId: string) {
    return await prisma.familyMember.findMany({
      where: {
        family_id: familyId,
        join_status: JoinStatus.APPROVED,
      },
      include: {
        user: {
          select: { id: true, full_name: true, email: true, phone: true },
        },
      },
    });
  },

  // Sub functions
  async belongsToAnyFamily(userId: string, tx: Prisma.TransactionClient) {
    const membership = await tx.familyMember.findFirst({
      where: {
        user_id: userId,
        join_status: JoinStatus.APPROVED,
      },
    });
    return !!membership;
  },

  async isOwnerOfAnyFamily(userId: string, tx: Prisma.TransactionClient) {
    const ownership = await tx.familyMember.count({
      where: {
        user_id: userId,
        family_role: FamilyRole.OWNER,
        join_status: JoinStatus.APPROVED,
      },
    });
    return ownership > 0;
  },

  async hasFamily(userId: string) {
    // Kiểm tra hết coi thuộc về gia đình bất kì nào ko
    const _ = await prisma.$transaction(async (tx) => {
      const membership = await this.belongsToAnyFamily(userId, tx);
      const isOwner = await this.isOwnerOfAnyFamily(userId, tx);
      return { membership, isOwner };
    });
    return _;
    // const membership = await prisma.familyMember.findFirst({
    //   where: {
    //     user_id: userId,
    //     join_status: JoinStatus.APPROVED
    //   }
    // });
    // return !!membership;
  },

  // =============== Quick Login (Device-Bound) ===============

  async findMemberById(memberId: string) {
    return await prisma.familyMember.findUnique({
      where: { id: memberId },
      include: {
        family: true,
        user: {
          select: { id: true, full_name: true, phone: true, email: true, avatar_url: true },
        },
      },
    });
  },

  async setupQuickLogin(
    memberId: string,
    data: {
      quick_device_hash: string;
      device_fingerprint: string;
      device_name?: string;
    },
  ) {
    return await prisma.quickLoginDevice.upsert({
      where: { member_id: memberId },
      update: {
        device_hash: data.quick_device_hash,
        device_fingerprint: data.device_fingerprint,
        device_name: data.device_name,
      },
      create: {
        member_id: memberId,
        device_hash: data.quick_device_hash,
        device_fingerprint: data.device_fingerprint,
        device_name: data.device_name,
      },
    });
  },

  async findDeviceByFingerprint(fingerprint: string) {
    return await prisma.quickLoginDevice.findUnique({
      where: { device_fingerprint: fingerprint },
      include: {
        familyMember: {
          include: { family: true },
        },
      },
    });
  },

  async findDeviceById(deviceId: string) {
    return await prisma.quickLoginDevice.findUnique({
      where: { id: deviceId },
      include: {
        familyMember: {
          include: { family: true },
        },
      },
    });
  },

  async updateQuickLoginAt(deviceId: string) {
    return await prisma.quickLoginDevice.update({
      where: { id: deviceId },
      data: { last_login_at: new Date() },
    });
  },

  async revokeQuickLogin(memberId: string) {
    try {
      return await prisma.quickLoginDevice.delete({
        where: { member_id: memberId },
      });
    } catch (e) {
      // Ignore if not found
      return null;
    }
  },

  async getDevicesByFamily(familyId: string) {
    return await prisma.quickLoginDevice.findMany({
      where: {
        familyMember: {
          family_id: familyId,
        },
      },
      include: {
        familyMember: true,
      },
    });
  },

  async createGuestMember(familyId: string, displayName: string, relation?: string) {
    return await prisma.familyMember.create({
      data: {
        family_id: familyId,
        user_id: null,
        display_name: displayName,
        family_role: 'MEMBER',
        family_relation: relation,
        join_status: JoinStatus.APPROVED,
      },
    });
  },

  async revokeFingerprint(fingerprint: string) {
    try {
      return await prisma.quickLoginDevice.delete({
        where: { device_fingerprint: fingerprint },
      });
    } catch (e) {
      return null;
    }
  },
};
