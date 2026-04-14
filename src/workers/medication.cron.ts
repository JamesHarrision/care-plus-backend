import cron from 'node-cron';
import MedicationSchedule from '../models/medication.model';
import { prisma } from '../config/prisma.config';
import { getChannel } from '../config/rabbitmq.config';

export const startMedicationCronJob = () => {
  // Quét mỗi phút một lần
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      
      // format giờ HH:mm theo timezone máy chủ local
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const currentTimeString = `${hh}:${mm}`;

      // Bắt tất cả các schedules hợp quy chuẩn, đang hoạt động & trong khoảng ngày
      const schedules = await MedicationSchedule.find({
        is_active: true,
        start_date: { $lte: now },
        $or: [
          { end_date: { $exists: false } },
          { end_date: null },
          { end_date: { $gte: now } }
        ],
        'medications.times': currentTimeString
      });

      if (schedules.length === 0) return;

      const channel = getChannel();

      for (const schedule of schedules) {
        // Tìm FamilyMember để lấy deviceToken (nếu system thay đổi lấy token ở đâu khác thì cập nhật tại đây)
        const member = await prisma.familyMember.findUnique({
          where: { id: schedule.family_member_id }
        });

        if (!member || !member.device_token) continue;

        // Tách ra các loại thuốc đúng giờ này
        const medsToTakeNow = schedule.medications.filter((m: any) => m.times?.includes(currentTimeString));
        
        for (const med of medsToTakeNow) {
           channel.sendToQueue(
            'notifications.medication',
            Buffer.from(JSON.stringify({
              deviceToken: member.device_token,
              reminderMessage: schedule.reminder_message || `Đến giờ uống thuốc rồi!`,
              medicationName: med.name,
              scheduleId: schedule._id.toString()
            }))
          );
        }
      }
    } catch (error) {
      console.error('❌ Lỗi khi chạy Cron Job nhắc uống thuốc:', error);
    }
  });

  console.log('✅ Đã khởi chạy Medication Cron Job quét mỗi phút.');
};
