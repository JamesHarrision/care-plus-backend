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

    // Push yêu cầu tham gia vào queue notifications.family cho Chủ hộ
    try {
      const { getChannel } = await import('../config/rabbitmq.config');
      getChannel().sendToQueue(
        'notifications.family',
        Buffer.from(JSON.stringify({
          type: 'JOIN_REQUEST',
          familyId,
          requesterId: userId
        }))
      );
    } catch (err) {
      console.error('RabbitMQ publish error (joinFamily):', err);
    }

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

    // Push vào RabbitMQ queue notifications.family
    try {
      const { prisma } = await import('../config/prisma.config');
      const member = await prisma.familyMember.findFirst({
        where: { id: memberId },
        include: { family: true }
      });

      if (member && member.user_id) {
        const { getChannel } = await import('../config/rabbitmq.config');
        getChannel().sendToQueue(
          'notifications.family',
          Buffer.from(JSON.stringify({
            type: 'JOIN_RESULT',
            userId: member.user_id,
            status,
            familyName: member.family?.name || 'Gia đình'
          }))
        );
      }
    } catch (err) {
      console.error('RabbitMQ publish error (family):', err);
    }
  },

  async getUserFamilies(userId: string) {
    const memberships = await familyRepository.getUserFamilies(userId);
    return memberships.map(m => ({
      family_id: m.family_id,
      family_name: m.family.name,
      family_address: m.family.address,
      family_role: m.family_role,
      joined_at: m.created_at
    }));
  },

  async getQuickLoginFamilies(memberId: string) {
    const member = await familyRepository.findMemberById(memberId);
    if (!member) return [];

    return [{
      family_id: member.family_id,
      family_name: member.family.name,
      family_address: member.family.address,
      family_role: member.family_role,
      joined_at: member.created_at
    }];
  },

  async getFamilyMembers(familyId: string) {
    const members = await familyRepository.getFamilyMembers(familyId);
    return members.map(m => ({
      member_id: m.id,
      user_id: m.user_id,
      full_name: m.display_name || m.user?.full_name || 'Hồ sơ khách',
      email: m.user?.email,
      phone: m.user?.phone,
      family_role: m.family_role,
      date_of_birth: m.date_of_birth,
      avatar_url: m.avatar_url,
      joined_at: m.created_at
    }));
  },

  // =============== Quick Login (Device-Bound) ===============

  async revokeDeviceLogin(ownerId: string, memberId: string) {
    // Verify member tồn tại
    const member = await familyRepository.findMemberById(memberId);
    if (!member) throw new Error('MEMBER_NOT_FOUND');

    // Verify owner là OWNER của family chứa member
    const ownerMember = await familyRepository.findFamilyMember(member.family_id, ownerId);
    if (!ownerMember || ownerMember.family_role !== 'OWNER') {
      throw new Error('INSUFFICIENT_FAMILY_ROLE');
    }

    await familyRepository.revokeQuickLogin(memberId);
  },

  async getFamilyDevices(familyId: string) {
    const devices = await familyRepository.getDevicesByFamily(familyId);
    return devices.map(d => ({
      member_id: d.member_id,
      display_name: d.familyMember.display_name,
      device_name: d.device_name,
      avatar_url: d.familyMember.avatar_url,
      family_relation: d.familyMember.family_relation,
      quick_login_at: d.last_login_at,
    }));
  },
  async createGuestMember(familyId: string, displayName: string, relation?: string) {
    return await familyRepository.createGuestMember(familyId, displayName, relation);
  },
};