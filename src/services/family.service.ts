import { familyRepository } from "../repositories/family.repository";

export const familyService = {
  async createFamily(userId: string, name: string, address?: string) {
    return await familyRepository.createFamily(userId, name, address);
  },

  async generateInviteCode(familyId: string) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    await familyRepository.saveInviteCode(familyId, code);
    return code;
  },

  async joinFamily(userId: string, inviteCode: string) {
    const familyId = await familyRepository.getFamilyIdByInviteCode(inviteCode);
    if (!familyId) {
      throw new Error('INVITE_INVALID_OR_EXPIRED');
    }

    const existingMember = await familyRepository.findFamilyMember(familyId, userId);
    if (existingMember) {
      throw new Error('ALREADY_MEMBER_OR_PENDING');
    }

    await familyRepository.addPendingMember(familyId, userId);
    return familyId;
  },

  async getPendingMembers(familyId: string) {
    const pendingList = await familyRepository.getPendingMember(familyId);
    return pendingList.map(p => ({
      id: p.id,
      user_id: p.user_id,
      full_name: p.user?.full_name,
      email: p.user?.email,
      phone: p.user?.phone,
      join_status: p.join_status
    }));
  },

  async reviewJoinRequest(familyId: string, memberId: string, status: 'APPROVED' | 'REJECTED') {
    const result = await familyRepository.updateMemberStatus(familyId, memberId, status);
    if (result.count === 0) throw new Error('MEMBER_NOT_FOUND');

    // Tạm thời log ra console thay vì dùng RabbitMQ/FCM để tiết kiệm thời gian (có thể bổ sung sau)
    console.log(`[RabbitMQ Mock] Gửi FCM đến user ${memberId}: Yêu cầu tham gia ${status}`);
  }

}