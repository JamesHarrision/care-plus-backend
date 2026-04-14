import * as admin from 'firebase-admin';

export const initializeFirebaseAdmin = () => {
  if (!admin.apps.length) {
    try {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      
      // Nếu thiếu cấu hình thì skip không khởi tạo Firebase để tránh crash app
      if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
        console.warn('⚠️ Thiếu biến môi trường Firebase (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY). Đang skip.');
        return;
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
      console.log('✅ Khởi tạo Firebase Admin thành công.');
    } catch (error) {
      console.error('❌ Lỗi khởi tạo Firebase Admin:', error);
    }
  }
};

export const sendPushNotification = async (token: string, title: string, body: string, data?: Record<string, string>) => {
  try {
    // Khởi tạo admin nếu chưa
    if (!admin.apps.length) {
       initializeFirebaseAdmin();
    }
    
    if (!admin.apps.length) {
       console.warn('⚠️ Firebase Admin chưa được khởi tạo. Không thể gửi push notification.');
       return;
    }

    const payload = {
      notification: {
        title,
        body,
      },
      data: data || {},
      token,
    };

    const response = await admin.messaging().send(payload);
    console.log('✅ Đã gửi push notification thành công đến', token, response);
    return response;
  } catch (error) {
    console.error('❌ Lỗi gửi push notification:', error);
  }
};
