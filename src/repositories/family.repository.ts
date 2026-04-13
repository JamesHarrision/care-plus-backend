import { prisma } from "../config/prisma.config";
import { FamilyRole, JoinStatus } from "@prisma/client";
import redisClient from "../config/redis.config";

export const familyRepository = {
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

  async createFamily(userId: string, name: string, address?: string) {
    return await prisma.$transaction(async (tx) => {
      const family = await tx.family.create({
        data: { name, address }
      });

      await tx.familyMember.create({
        data: {
          family_id: family.id,
          user_id: userId,
          family_role: "OWNER",
          join_status: JoinStatus.APPROVED
        }
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
      }
    })
  },

  async getPendingMember(familyId: string) {
    return await prisma.familyMember.findMany({
      where: {
        family_id: familyId,
        join_status: JoinStatus.PENDING
      },
      include: {
        user: {
          select: { id: true, full_name: true, email: true, phone: true }
        }
      }
    })
  },

  async updateMemberStatus(familyId: string, memberId: string, status: 'APPROVED' | 'REJECTED') {
    return await prisma.familyMember.updateMany({
      where: {
        family_id: familyId,
        user_id: memberId
      },
      data: {
        join_status: status
      }
    })
  },

  async getUserFamilies(userId: string) {
    return await prisma.familyMember.findMany({
      where: {
        user_id: userId,
        join_status: JoinStatus.APPROVED
      },
      include: {
        family: true
      }
    });
  },

  async getFamilyMembers(familyId: string) {
    return await prisma.familyMember.findMany({
      where: {
        family_id: familyId,
        join_status: JoinStatus.APPROVED
      },
      include: {
        user: {
          select: { id: true, full_name: true, email: true, phone: true }
        }
      }
    });
  }

}