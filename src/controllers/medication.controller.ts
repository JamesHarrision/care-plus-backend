import { Request, Response } from 'express';
import MedicationSchedule from '../models/medication.model';
import { AIService } from '../services/ai.service';
import { prisma } from '../config/prisma.config';
import { medicationService } from '../services/medication.service';

export const createMedicationSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { familyId, memberId } = req.params;
    const { medications, start_date, end_date, session_times } = req.body;

    if (!medications || !Array.isArray(medications) || !start_date) {
      res.status(400).json({ status: 'error', message: 'Missing required fields in body.' });
      return;
    }

    // Fetch family member from Prisma to get age and name for AI
    const familyMember = await prisma.familyMember.findFirst({
      where: { id: memberId as string },
      include: { user: true }
    });

    if (!familyMember || familyMember.family_id !== familyId) {
      res.status(404).json({ status: 'error', message: 'Family member not found' });
      return;
    }

    let memberAge = 30; // default age
    if (familyMember.date_of_birth) {
      const diff = Date.now() - new Date(familyMember.date_of_birth).getTime();
      memberAge = Math.abs(new Date(diff).getUTCFullYear() - 1970);
    }
    const memberName = (familyMember.user as any)?.full_name || 'Thành viên gia đình';

    // Call AI to generate a reminder message
    const reminderMessage = await AIService.generateReminder(memberAge, memberName);

    // Lấy custom times từ request hoặc dùng mặc định
    const timesMap = (session_times && Array.isArray(session_times) && session_times.length === 4) 
                     ? session_times 
                     : ['08:00', '12:00', '14:00', '20:00'];

    // Convert binary bin string to times array if missing
    const processedMedications = medications.map((med: any) => {
      let times = med.times || [];
      if (times.length === 0 && med.bin && med.bin.length === 4) {
        if (med.bin[0] === '1') times.push(timesMap[0]); // Sáng
        if (med.bin[1] === '1') times.push(timesMap[1]); // Trưa
        if (med.bin[2] === '1') times.push(timesMap[2]); // Chiều
        if (med.bin[3] === '1') times.push(timesMap[3]); // Tối
      }
      return { ...med, times: times.length > 0 ? times : [timesMap[0]] };
    });

    // Save to Mongoose
    const newSchedule = new MedicationSchedule({
      family_id: familyId,
      family_member_id: memberId,
      medications: processedMedications,
      start_date: new Date(start_date),
      end_date: end_date ? new Date(end_date) : undefined,
      reminder_message: reminderMessage,
      session_times: timesMap
    });

    const savedSchedule = await newSchedule.save();



    res.status(201).json({
      status: 'success',
      data: {
        scheduleId: savedSchedule._id,
        reminderMessage
      }
    });

  } catch (error: any) {
    console.error('Create Medication Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const getMedicationsByMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { familyId, memberId } = req.params as { familyId: string, memberId: string };
    const schedules = await medicationService.getMedicationsByMember(familyId, memberId);

    res.status(200).json({
      status: 'success',
      data: { schedules }
    });
  } catch (error: any) {
    console.error('Get Medications Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const updateMedicationSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { familyId, memberId, id } = req.params as { familyId: string, memberId: string, id: string };
    const { medications, start_date, end_date } = req.body;

    const schedule = await medicationService.updateMedicationSchedule(familyId, memberId, id, {
      medications,
      start_date,
      end_date
    });

    res.status(200).json({
      status: 'success',
      data: { schedule }
    });
  } catch (error: any) {
    console.error('Update Medication Error:', error);
    if (error.message === 'Lịch uống thuốc không tồn tại' || error.message === 'Không có quyền sửa lịch uống thuốc này') {
      res.status(400).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const deleteMedicationSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { familyId, memberId, id } = req.params as { familyId: string, memberId: string, id: string };
    await medicationService.deleteMedicationSchedule(familyId, memberId, id);

    res.status(200).json({
      status: 'success',
      data: { message: 'Xóa lịch uống thuốc thành công' }
    });
  } catch (error: any) {
    console.error('Delete Medication Error:', error);
    if (error.message === 'Lịch uống thuốc không tồn tại' || error.message === 'Không có quyền xóa lịch uống thuốc này') {
      res.status(400).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const confirmTaken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const userId = (req as any).user?.id || (req as any).user?.userId; // Adjust according to authentication implementation

    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    await medicationService.confirmTaken(id, userId as string);

    res.status(200).json({
      status: 'success',
      data: { message: 'Xác nhận uống thuốc thành công' }
    });
  } catch (error: any) {
    console.error('Confirm Taken Error:', error);
    if (error.message === 'Lịch uống thuốc không tồn tại') {
      res.status(400).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
