# Hướng dẫn Setup MongoDB

## 1. Cài đặt MongoDB

Bạn có 2 lựa chọn:

### Option 1: MongoDB Atlas (Cloud - Recommended)
1. Truy cập: https://www.mongodb.com/cloud/atlas
2. Tạo tài khoản miễn phí
3. Tạo cluster mới
4. Lấy connection string

### Option 2: MongoDB Local
1. Cài đặt MongoDB Community Edition
2. Khởi động MongoDB service
3. Sử dụng connection string: `mongodb://localhost:27017/nongsan`

## 2. Tạo file .env.local

Tạo file `.env.local` trong thư mục root với nội dung:

```env
# MongoDB Connection String
# MongoDB Atlas (Cloud):
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nongsan?retryWrites=true&w=majority

# Hoặc MongoDB Local:
# MONGODB_URI=mongodb://localhost:27017/nongsan
```

**Lưu ý:** Thay `username`, `password` và `cluster` bằng thông tin thực tế của bạn.

## 3. Cấu trúc Database

Database sẽ tự động tạo collection `categories` khi bạn tạo category đầu tiên.

## 4. Kiểm tra kết nối

Sau khi cấu hình xong, khởi động lại server:
```bash
npm run dev
```

Kiểm tra console để thấy thông báo: `✅ MongoDB Connected Successfully`

## 5. Test API

Bạn có thể test API bằng cách:
- Mở trình duyệt: http://localhost:3000/admin/categories
- Hoặc dùng Postman/Thunder Client để test các endpoints:
  - GET `/api/categories`
  - POST `/api/categories`
  - GET `/api/categories/[id]`
  - PUT `/api/categories/[id]`
  - DELETE `/api/categories/[id]`

## Troubleshooting

### Lỗi: "Please define the MONGODB_URI environment variable"
- Kiểm tra file `.env.local` đã được tạo chưa
- Đảm bảo tên biến là `MONGODB_URI`
- Khởi động lại server sau khi tạo file

### Lỗi kết nối MongoDB Atlas
- Kiểm tra IP address đã được whitelist trong MongoDB Atlas
- Kiểm tra username/password đúng chưa
- Kiểm tra network access settings trong Atlas

### Lỗi kết nối MongoDB Local
- Đảm bảo MongoDB service đang chạy
- Kiểm tra port 27017 đã được mở chưa

