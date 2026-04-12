import { healthRecordRepository } from "../repositories/health-record.repository";

const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export const healthRecordService = {
  async getRecords(
    familyMemberId: string,
    filters: { date?: string, type?: string }
  ) {
    return await healthRecordRepository.findMany(familyMemberId, filters);
  },

  async createRecord(data: {
    family_member_id: string;
    family_id: string;
    updated_by_user_id: string;
    type: string;
    value: Record<string, any>;
    unit: string;
    note?: string;
    recorded_at?: Date;
  }) {
    return await healthRecordRepository.create(data);
  },

  async updateRecord(
    recordId: string,
    familyRole: 'OWNER' | 'MEMBER',
    data: {
      value?: Record<string, any>
      unit?: string,
      note?: string
    }
  ) {

    const record = await healthRecordRepository.findById(recordId);
    if (!record) throw new Error('RECORD_NOT_FOUND');

    if (familyRole === 'MEMBER' && !isToday(record.recorded_at)) {
      throw new Error('CANNOT_EDIT_PAST_RECORD');
    }

    return await healthRecordRepository.update(recordId, data);
  },

  async deleteRecord(recordId: string, familyRole: "OWNER" | "MEMBER") {
    const record = await healthRecordRepository.findById(recordId);
    if (!record) throw new Error('RECORD_NOT_FOUND');

    if (familyRole === 'MEMBER') throw new Error('INSUFFICIENT_PERMISSION');

    return await healthRecordRepository.delete(recordId);
  }
}