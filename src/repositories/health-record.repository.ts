import { create } from 'node:domain';
import HealthRecord from '../models/health-record.model';

export const healthRecordRepository = {
  async findMany(familyMemberId: string, filters: { date?: string; type?: string }) {
    const query: Record<string, any> = { family_member_id: familyMemberId };

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.date) {
      const start = new Date(filters.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(filters.date);
      end.setHours(23, 59, 59, 999);
      query.recorded_at = { $gte: start, $lte: end };
    }

    return await HealthRecord.find(query).sort({ recorded_at: -1 });
  },

  async create(data: {
    family_member_id: string;
    // family_id: string;
    updated_by_user_id: string;
    type: string;
    value: Record<string, any>;
    unit: string;
    note?: string;
    recorded_at?: Date;
  }) {
    return await HealthRecord.create(data);
  },

  async findById(recordId: string) {
    return await HealthRecord.findById(recordId);
  },

  async update(
    recordId: string,
    data: {
      value?: Record<string, any>;
      unit?: string;
      note?: string;
    },
  ) {
    const updatedRecord = await HealthRecord.findByIdAndUpdate(recordId, data, { new: true });

    return updatedRecord;
  },

  async delete(recordId: string) {
    return await HealthRecord.findByIdAndDelete(recordId);
  },
};
