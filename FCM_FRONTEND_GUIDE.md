# Hướng Dẫn Tích Hợp Push Notification (FCM) Cho Frontend

Tài liệu này mô tả luồng hoạt động (flow), các API cần gọi, và cấu trúc dữ liệu Push Notification mà Backend sẽ đẩy về cho Frontend.

---

## 1. Flow Cập Nhật Device Token

Để nhận được thông báo, Frontend cần cung cấp **FCM Device Token** của thiết bị cho Backend sau khi người dùng đăng nhập thành công. Lộ trình như sau:

1. **Đăng nhập:** Người dùng đăng nhập (hoặc đăng ký) và nhận lại `accessToken` (JWT) từ API của Backend.
2. **Lấy FCM Token:** Frontend sử dụng thư viện SDK của Firebase (vd: `@react-native-firebase/messaging` cho app, hoặc `firebase/messaging` cho web) để xin cấp quyền gửi thông báo (`requestPermission()`) và lấy chuỗi Device Token (`getToken()`).
3. **Gửi Token lên Backend:** Ngay sau khi có JWT và FCM Token, Frontend phải bắn 1 request tới Backend để lưu lại Token vào Database của người đó.
4. **Lắng nghe sự kiện:** Frontend thiết lập các hàm `onMessage` (nhận thông báo khi mở app) hoặc `setBackgroundMessageHandler` (khi app chạy ngầm/bị tắt) để bắt thông báo.

### Thông tin API Backend
- **Endpoint:** `POST /api/user/device-token`
- **Headers:** 
  - `Authorization: Bearer <accessToken_của_bạn>`
  - `Content-Type: application/json`
- **Body:**
```json
{
  "deviceToken": "dpf9x_... (chuỗi token lấy từ Firebase SDK)"
}
```
- **Response (200 OK):**
```json
{
  "status": "success",
  "data": { "message": "Cập nhật device token thành công" }
}
```

> [!CAUTION]
> Bất cứ khi nào FCM Token của thiết bị bị thay đổi (quá hạn hoặc cài đặt lại app), hoặc tài khoản đăng nhập/đăng xuất, bạn nên gọi lại hàm lấy Token và bắn lại API này nhằm đảm bảo tính chính xác của thiết bị nhận.

---

## 2. Cấu Trúc Payload FCM (Data Message)

Backend đẩy notification về thiết bị với cấu trúc chung gồm 2 phần là `notification` (tiêu đề, nội dung chung hiển thị ra màn hình) và `data` (dữ liệu ẩn đi kèm để dev front-end xử lý logic). 

### 2.1 Loại 1: Xin gia nhập Gia đình (`FAMILY_JOIN_REQUEST`)
**Nơi nhận:** Tài khoản của người làm CHỦ NHÀ (OWNER).
- `notification.title`: "Yêu cầu tham gia mới"
- `notification.body`: "Nguyễn Văn A đã yêu cầu tham gia gia đình Hạnh Phúc."
- `data`:
```json
{
  "type": "FAMILY_JOIN_REQUEST",
  "familyId": "id_cua_gia_dinh",
  "requesterId": "id_cua_nguoi_xin_vao"
}
```
*Gợi ý UI:* Khi bấm vào, nên mở màn hình danh sách thành viên ở trạng thái "Chờ duyệt" của family đó.

### 2.2 Loại 2: Kết quả xin gia nhập (`FAMILY_JOIN_RESULT`)
**Nơi nhận:** Tài khoản của NGƯỜI DÙNG gửi Request.
- `notification.title`: "Yêu cầu được chấp nhận" / "Yêu cầu bị từ chối"
- `notification.body`: "Bạn đã được thêm vào gia đình Hạnh Phúc!"
- `data`:
```json
{
  "type": "FAMILY_JOIN_RESULT",
  "status": "APPROVED" // hoặc "REJECTED"
}
```
*Gợi ý UI:* Refresh lại danh sách Family ở trang Home, hiển thị thêm Family vừa được chấp nhận.

### 2.3 Loại 3: Nhắc nhở uống thuốc (`MEDICATION_REMINDER`)
**Nơi nhận:** Thành viên được gán lịch uống thuốc trong Gia đình.
- `notification.title`: "💊 Nhắc uống thuốc"
- `notification.body`: "(Câu nói nhắc nhở được tạo tự động bởi AI, vd: Ông ơi, đã đến giờ uống thuốc sáng rồi!)"
- `data`:
```json
{
  "type": "MEDICATION_REMINDER",
  "scheduleId": "id_cua_lich_uong_thuoc"
}
```
*Gợi ý UI:* Mở màn hình Chi tiết lịch uống thuốc hoặc popup xác nhận "Đã uống thuốc" dựa vào `scheduleId`.

---

## 3. Một số lưu ý đối với Frontend
1. Khi frontend gọi login và gửi cái token thành công nhưng **sau đó user đó Log out**, Frontend nên xóa FCM Token đó ở dưới DB Backend (hoặc call lại api /device-token với giá trị rỗng `""`) để người đến sau (nếu dùng chung máy mượn) không bị nhận push rác.
2. Từ khóa nằm trong field `data.type` bắt buộc dùng để switch-case điều hướng màn hình.
3. Trong Android, các trường `data` đôi khi đều bị chuyển ép kiểu sang `String`. Hãy sử dụng `string` để check dữ liệu lấy về cẩn thận nhé.
