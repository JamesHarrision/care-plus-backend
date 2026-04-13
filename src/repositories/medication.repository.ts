import MedicationSchedule, { IMedicationSchedule } from '../models/medication.model';

export class MedicationRepository {
  async findByMember(memberId: string): Promise<IMedicationSchedule[]> {
    return MedicationSchedule.find({ family_member_id: memberId, is_active: true });
  }

  async findById(id: string): Promise<IMedicationSchedule | null> {
    return MedicationSchedule.findById(id);
  }

  async updateById(id: string, updateData: Partial<IMedicationSchedule>): Promise<IMedicationSchedule | null> {
    // Exclude family_id and family_member_id from update
    delete updateData.family_id;
    delete updateData.family_member_id;

    return MedicationSchedule.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
  }

  async deleteById(id: string): Promise<IMedicationSchedule | null> {
    return MedicationSchedule.findByIdAndUpdate(
      id,
      { $set: { is_active: false } },
      { new: true }
    );
  }

  async confirmTaken(id: string, userId: string): Promise<IMedicationSchedule | null> {
    return MedicationSchedule.findByIdAndUpdate(
      id,
      { $set: { confirmed_by: userId } },
      { new: true }
    );
  }
}

export const medicationRepository = new MedicationRepository();
