import { medicationRepository } from '../repositories/medication.repository';
import { IMedicationSchedule } from '../models/medication.model';

export class MedicationService {
  async getMedicationsByMember(familyId: string, memberId: string): Promise<IMedicationSchedule[]> {
    // Optionally check if the member belongs to the family here, or trust the middleware/controller
    return medicationRepository.findByMember(memberId);
  }

  async updateMedicationSchedule(
    familyId: string,
    memberId: string,
    scheduleId: string,
    updateData: Partial<IMedicationSchedule>
  ): Promise<IMedicationSchedule> {
    const schedule = await medicationRepository.findById(scheduleId);
    if (!schedule) {
      throw new Error('Lịch uống thuốc không tồn tại');
    }

    if (schedule.family_id !== familyId || schedule.family_member_id !== memberId) {
      throw new Error('Không có quyền sửa lịch uống thuốc này');
    }

    // Force remove restricted fields just in case
    delete updateData.family_id;
    delete updateData.family_member_id;

    const updatedSchedule = await medicationRepository.updateById(scheduleId, updateData);
    if (!updatedSchedule) {
      throw new Error('Lỗi khi cập nhật lịch uống thuốc');
    }

    return updatedSchedule;
  }

  async deleteMedicationSchedule(familyId: string, memberId: string, scheduleId: string): Promise<void> {
    const schedule = await medicationRepository.findById(scheduleId);
    if (!schedule) {
      throw new Error('Lịch uống thuốc không tồn tại');
    }

    if (schedule.family_id !== familyId || schedule.family_member_id !== memberId) {
      throw new Error('Không có quyền xóa lịch uống thuốc này');
    }

    await medicationRepository.deleteById(scheduleId);
  }

  async confirmTaken(scheduleId: string, userId: string): Promise<void> {
    const schedule = await medicationRepository.findById(scheduleId);
    if (!schedule) {
      throw new Error('Lịch uống thuốc không tồn tại');
    }

    await medicationRepository.confirmTaken(scheduleId, userId);
  }
}

export const medicationService = new MedicationService();
