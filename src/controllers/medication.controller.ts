import { Request, Response } from 'express';
import MedicationSchedule from '../models/medication.model';
import { AIService } from '../services/ai.service';
import { prisma } from '../config/prisma.config';

export const createMedicationSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { familyId, memberId } = req.params;
    const { medications, start_date, end_date } = req.body;

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

    // Save to Mongoose
    const newSchedule = new MedicationSchedule({
      family_id: familyId,
      family_member_id: memberId,
      medications,
      start_date: new Date(start_date),
      end_date: end_date ? new Date(end_date) : undefined,
      reminder_message: reminderMessage
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
