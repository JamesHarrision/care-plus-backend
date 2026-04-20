> **🧭 Điều hướng dự án:**
>
> - 📱 [**Frontend Repository (Hiện tại)**](https://github.com/shinsouhitoshi1203/care-plus-frontend)
> - ⚙️ [**Backend Repository (Care Plus Backend)**](https://github.com/JamesHarrision/care-plus-backend)

# Care Plus Backend

Đây là repository backend cho dự án **Care Plus**. Hệ thống backend này cung cấp các API để quản lý hồ sơ sức khỏe, thông tin y tế, xác thực người dùng, và tích hợp các tính năng khẩn cấp (SOS) kèm theo hệ thống gửi thông báo thời gian thực.

## 🚀 Công Nghệ Sử Dụng (Tech Stack)

Dự án được xây dựng dựa trên các công nghệ hiện đại, bao gồm:
- **Ngôn ngữ & Framwork**: Node.js, TypeScript, Express.js.
- **Cơ sở dữ liệu (Databases)**: 
  - **MySQL**: Cơ sở dữ liệu quan hệ (relational database), được quản lý thông qua **Prisma ORM** để lưu trữ thông tin có cấu trúc chặt chẽ (người dùng, quan hệ...).
  - **MongoDB**: Sử dụng qua **Mongoose** để lưu trữ các dữ liệu có cấu trúc linh hoạt hoặc hồ sơ phức tạp.
- **Message Broker & Background Jobs**: 
  - **RabbitMQ**: Message queue sử dụng cho các worker xử lý nền, đặc biệt là tính năng gửi cảnh báo khẩn cấp (SOS).
- **Caching**: **Redis** cho các phản hồi cần được tăng tốc hoặc lưu trữ state tạm thời.
- **Thông báo (Push Notifications)**: **Firebase Cloud Messaging (FCM)** thông qua `firebase-admin` để đẩy thông báo tới ứng dụng di động theo thời gian thực.
- **Tính năng mở rộng khác**:
  - Gửi email thông qua `Nodemailer`.
  - Hỗ trợ AI (Generative AI) thông qua `@google/genai`.
  - Phân tích và tạo QR Code.
  - Lên lịch tự động (Cron jobs) với `node-cron`.

## 📁 Cấu Trúc Thư Mục (Folder Structure)

```text
care-plus
├── .env.docker           # Biến môi trường chạy docker-compose
├── docker-compose.yml    # File cấu hình triển khai thông qua Docker
├── Dockerfile            # Cấu hình build Docker image cho backend
├── package.json          # Danh sách dependencies và scripts
├── prisma/               # Schema và cấu hình Prisma ORM
└── src/
    ├── config/           # Cấu hình database, redis, rabbitmq, fcm...
    ├── controllers/      # Các file chứa logic xử lý các endpoint HTTP
    ├── interfaces/       # Khai báo TypeScript Interface / Type
    ├── middlewares/      # Interceptor, validate request, xác thực token...
    ├── models/           # Định nghĩa Mongoose schemas và cấu trúc dữ liệu
    ├── repositories/     # Lớp truy cập database (Pattern Repository)
    ├── routes/           # Định nghĩa các endpoint (API Routes)
    ├── services/         # Nơi chứa Core Business Logic
    ├── utils/            # Helper functions thường xuyên được sử dụng
    ├── workers/          # Xử lý các job được tạo cho RabbitMQ
    ├── app.ts            # Nơi cấu hình tầng route, express app
    └── server.ts         # Khởi động server (entry point)
```

## 🔐 Bảo Mật (Security)
* Dự án có hỗ trợ `helmet` cho các header bảo mật HTTP.
* Mã hóa mật khẩu thông qua `bcrypt`.
* Xác thực bằng quyền qua `jsonwebtoken` (JWT).

## 📄 Tài liệu liên quan
- Tham khảo thêm file `FCM_FRONTEND_GUIDE.md` để hiểu cách hệ thống Frontend giao tiếp với Backend cho việc gửi thông báo FCM.
- Tham khảo `redis-set-up.md` nếu muốn hiểu thêm về cách cài đặt Caching bằng Redis.
- Xem hướng dẫn chạy server tại file `install.md`.
