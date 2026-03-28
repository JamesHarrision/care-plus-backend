# Redis Setup bằng Docker + Redis Insight (Windows)
## 1. Cài Docker

Tải và cài Docker Desktop:

https://www.docker.com/products/docker-desktop/

Sau khi cài xong, mở CMD hoặc Terminal và chạy:

docker --version

Nếu hiện version → Docker đã cài thành công.

## 2. Chạy Redis bằng Docker

Chỉ cần 1 lệnh duy nhất:

docker run -d -p 6379:6379 --name redis-local redis

Giải thích:

Lệnh	Ý nghĩa
-d	chạy background
6379:6379	mở port Redis ra ngoài máy
--name redis-local	đặt tên container
redis	image Redis chính thức

## 3. Kiểm tra Redis đã chạy chưa

Chạy:

docker ps

Nếu thấy:

redis-local

là Redis đã chạy OK.

## 4. Cài Redis Insight (GUI giống MySQL Workbench)

Tải tại đây:

https://redis.io/docs/latest/operate/redisinsight/install/install-on-desktop/

Cài xong mở Redis Insight lên.

## 5. Kết nối Redis trong Redis Insight

Bấm Add Redis Database

Điền:

Host: localhost
Port: 6379
Name: local-redis

Sau đó bấm Connect

## 6. Test Redis luôn cho chắc

Trong Redis Insight → mở Console → chạy:

SET name bao
GET name

Nếu trả:

bao

=> Redis đã chạy thành công.

## 7. Cách bật lại Redis lần sau

Không cần chạy lại lệnh docker run.

Chỉ cần:

docker start redis-local

## 8. Cách tắt Redis
docker stop redis-local

## 9. Nếu muốn xóa Redis luôn
docker rm -f redis-local

## 10. Dùng Redis trong project Node.js

Cài package:

npm install redis