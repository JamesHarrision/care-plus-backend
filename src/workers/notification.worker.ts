import { getChannel } from '../config/rabbitmq.config';
import { sendPushNotification } from '../config/fcm.config';
import { prisma } from '../config/prisma.config';

export const startNotificationWorker = async () => {
  try {
    const channel = getChannel();

    // Lắng nghe queue family
    channel.consume('notifications.family', async (msg: any) => {
      if (msg !== null) {
        try {
          const payload = JSON.parse(msg.content.toString());
          const { userId, status, familyName, type, familyId, requesterId } = payload;

          if (type === 'JOIN_REQUEST') {
            // 1. Phía Chủ nhà: Gửi thông báo có người xin tham gia
            const family = await prisma.family.findUnique({ where: { id: familyId } });
            const requester = await prisma.user.findUnique({ where: { id: requesterId } });
            
            if (family && requester) {
              // Tìm danh sách chủ nhà của gia đình
              const owners = await prisma.familyMember.findMany({
                where: { family_id: familyId, family_role: 'OWNER' },
              });
              
              const tokens = [...new Set(owners.map(o => o.device_token).filter(Boolean))] as string[];
              if (tokens.length > 0) {
                const title = 'Yêu cầu tham gia mới';
                const body = `${requester.full_name || 'Một người dùng'} đã yêu cầu tham gia gia đình ${family.name}.`;
                
                const sendPromises = tokens.map(token =>
                  sendPushNotification(token, title, body, {
                    type: 'FAMILY_JOIN_REQUEST',
                    familyId: familyId,
                    requesterId: requesterId
                  })
                );
                await Promise.all(sendPromises);
              }
            }
          } else if (type === 'EMERGENCY_SOS') {
            const { senderId, senderName, familyIds, location } = payload;
            
            console.log(`[WORKER] Đã nhận tín hiệu KÊU CỨU (SOS) từ ${senderName}! (senderId: ${senderId}, families: ${familyIds.join(', ')})`);

            const members = await prisma.familyMember.findMany({
              where: {
                 family_id: { in: familyIds } 
              }
            });

            // Lọc ra các device token, loại trừ senderId nếu cần thiết, nhưng an toàn nhất là push hết cho những ai có token và không phải là người gửi
            const tokens = [...new Set(members
               .filter(m => m.id !== senderId && m.user_id !== senderId) // Exclude the sender
               .map(m => m.device_token).filter(Boolean))] as string[];

            if (tokens.length > 0) {
              const title = '🚨 KHẨN CẤP / SOS! 🚨';
              const body = `${senderName} đang cần sự trợ giúp ngay lập tức!`;
              const dataToPush: any = {
                type: 'EMERGENCY_SOS',
                senderId: senderId,
              };
              if (location) {
                 dataToPush.latitude = location.latitude?.toString();
                 dataToPush.longitude = location.longitude?.toString();
              }

              const sendPromises = tokens.map(token => 
                sendPushNotification(token, title, body, dataToPush)
              );

              await Promise.all(sendPromises);
            }
          } else if (type === 'JOIN_RESULT') {
            // 2. Phía Người dùng: Gửi thông báo kết quả duyệt gia đình (JOIN_RESULT hoặc cũ)
            const members = await prisma.familyMember.findMany({
              where: { user_id: userId },
            });

            // User có thể có nhiều profile trong các family khác nhau, ta gửi cho mọi device_token unique
            const tokens = [...new Set(members.map(m => m.device_token).filter(Boolean))] as string[];

            if (tokens.length > 0) {
              const title = status === 'APPROVED' ? 'Yêu cầu được chấp nhận' : 'Yêu cầu bị từ chối';
              const body = status === 'APPROVED' ? `Bạn đã được thêm vào gia đình ${familyName}!` : `Yêu cầu tham gia ${familyName} bị từ chối.`;

              const sendPromises = tokens.map(token => 
                sendPushNotification(token, title, body, {
                  type: 'FAMILY_JOIN_RESULT',
                  status: status,
                })
              );

              await Promise.all(sendPromises);
            }
          }

          channel.ack(msg);
        } catch (error) {
          console.error('❌ Lỗi xử lý message notifications.family:', error);
          // Không nên ack nếu lỗi logic để retry, hoặc ack nếu chỉ là lỗi format (có thể DLQ sau này)
          channel.ack(msg);
        }
      }
    });

    // Lắng nghe queue medication
    channel.consume('notifications.medication', async (msg: any) => {
      if (msg !== null) {
        try {
          const payload = JSON.parse(msg.content.toString());
          const { deviceToken, reminderMessage, medicationName, scheduleId } = payload;

          if (deviceToken) {
            await sendPushNotification(deviceToken, '💊 Nhắc uống thuốc', reminderMessage, {
              type: 'MEDICATION_REMINDER',
              scheduleId: scheduleId,
            });
          }

          channel.ack(msg);
        } catch (error) {
          console.error('❌ Lỗi xử lý message notifications.medication:', error);
          channel.ack(msg);
        }
      }
    });

    console.log('✅ Notification Worker đang lắng nghe mssages...');
  } catch (error) {
    console.error('❌ Lỗi khởi động Notification Worker:', error);
  }
};
