# Hướng Dẫn Cài Đặt và Chạy Backend (Care-Plus)

Tài liệu này cung cấp hướng dẫn cách thiết lập môi trường và khởi chạy server backend `care-plus` một cách nhanh chóng sử dụng cấu hình Docker Compose có sẵn trong dự án.

## 📝 Giới Thiệu (Repo Description)
Repository backend này thuộc dự án Care Plus, chịu trách nhiệm cung cấp API để quản lý người dùng, hồ sơ sức khỏe và nổi bật nhất là hệ thống SOS với thông báo cảnh báo khẩn cấp theo thời gian thực (Push Notifications) thông qua FCM. Hệ thống sử dụng một kiến trúc lai giữa MySQL và MongoDB, làm việc đồng thời cùng Redis (Caching) và RabbitMQ (Message Broker / Queues).

## 🔧 Yêu Cầu Cài Đặt (Prerequisites)
Bạn cần phải cài đặt sẵn các phần mềm sau trên hệ thống:
* **Docker** (phiên bản 20.10 trở lên)
* **Docker Compose** (hoặc Docker Desktop đã bao gồm công cụ này)
* **Git** để clone ứng dụng.

## 🚀 Các Bước Chạy Server (Cấu hình trên Branch `main`)

### Bước 1: Clone Repository
Nếu bạn chưa tải source code về máy, hãy chạy lệnh:
```bash
git clone <đường-dẫn-repo-care-plus>
cd care-plus
```
Hãy chắc chắn rằng bạn đang ở branch `main`:
```bash
git checkout main
```

### Bước 2: Cấu Hình Biến Môi Trường (.env.docker)
File `docker-compose.yml` trên dự án này được trỏ trực tiếp đến việc đọc biến môi trường tại `.env.docker`. File này phải có cấu trúc như sau (trong trường hợp file `.env.docker` chưa có sẵn, hãy tạo mới một file và điền vào theo mẫu sau):

```env
PORT=8080

# DB Connect String (Aiven/MySQL)
DATABASE_URL="mysql://<user>:<password>@<host>:<port>/defaultdb?ssl-mode=accept_invalid_certs"

# MongoDB connection
MONGO_URI="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/"

# JWT Secrets
JWT_ACCESS_SECRET=chuoi_bi_mat_access_cuc_ky_an_toan_yes_supa_sercue
JWT_REFRESH_SECRET=chuoi_bi_mat_refresh_cuc_ky_an_toan_yes_supa_sercue

# SMTP Nodemailer
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email-cua-ban@gmail.com
SMTP_PASS=app-password-cua-ban

# Các Cấu Hình mạng cục bộ chạy qua Docker Compose (KHÔNG ĐƯỢC THAY ĐỔI URL)
REDIS_URL=redis://redis:6379
RABBITMQ_URL=amqp://rabbitmq:5672

# Firebase Cloud Message (Service Account Info)
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

*Lưu ý:* Các biến `REDIS_URL` và `RABBITMQ_URL` bắt buộc phải trỏ đến `redis` và `rabbitmq` thay vì `localhost` nếu chạy container hóa đồng bộ thông qua `docker-compose.yml`.

### Bước 3: Khởi Động Server Bằng Docker Compose
Chạy toàn bộ dịch vụ backend (bao gồm Redis, RabbitMQ và Node Server) dưới nền (background) bằng câu lệnh sau:

```bash
docker-compose up -d --build
```

**Các container sẽ được tạo bao gồm:**
1. `careplus_redis`: Container Redis chạy ở cổng `6379`.
2. `careplus_rabbitmq`: Container RabbitMQ hoạt động ở cổng `5672` và Management UI `15672`. 
3. `careplus_backend`: Container chính chạy API Backend của Node.js, expose ra bên ngoài ở cổng `8080`.

### Bước 4: Kiểm Tra Trạng Thái
Để đảm bảo tất cả dịch vụ đều đang chạy tốt mà không có lỗi:

```bash
# Kiểm tra danh sách container
docker ps

# Kiểm tra log của backend nếu có lỗi xảy ra
docker logs -f careplus_backend
```

### Bước 5: Truy Cập
Nếu thành công, server Backend sẽ khả dụng tại: 
👉 `http://localhost:8080`

Đồng thời, bạn có thể truy cập **RabbitMQ Management UI** theo địa chỉ: 
👉 `http://localhost:15672` *(Tài khoản mặc định: `guest` / `guest`)*

---

### Cách Tắt Server
Khi không có nhu cầu phát triển thêm, bạn có thể tắt các container (giữ nguyên config và network) bằng lệnh:
```bash
docker-compose down
```
Hoặc để xóa hẳn các volumes (xóa cache redis/rabbitmq messages):
```bash
docker-compose down -v
```
