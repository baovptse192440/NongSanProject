# Hướng dẫn cài đặt TinyMCE

## Vấn đề
Nếu bạn gặp lỗi: `Module not found: Can't resolve '@tinymce/tinymce-react'`, điều này có nghĩa là package chưa được cài đặt vào `node_modules`.

## Giải pháp

### Cách 1: Sử dụng Command Prompt (CMD) thay vì PowerShell

1. Mở **Command Prompt** (không phải PowerShell):
   - Nhấn `Win + R`
   - Gõ `cmd` và nhấn Enter

2. Di chuyển đến thư mục project:
   ```bash
   cd D:\HK2_22-23\Thuc_tap_tot_nghiep\WEBSITE_NONGSAN\NongSanProject
   ```

3. Chạy lệnh cài đặt:
   ```bash
   npm install
   ```

   Hoặc cài đặt riêng TinyMCE packages:
   ```bash
   npm install @tinymce/tinymce-react tinymce --save
   ```

4. Sau khi cài đặt xong, chạy script copy TinyMCE vào public folder:
   ```bash
   node scripts/copy-tinymce.js
   ```

### Cách 2: Sử dụng file batch script

1. Double-click vào file `install-tinymce.bat` hoặc `install-tinymce.cmd` trong thư mục project
2. Script sẽ tự động cài đặt packages và copy TinyMCE vào public folder

### Cách 3: Cho phép PowerShell chạy scripts (khuyến nghị cho tương lai)

Nếu bạn muốn sử dụng PowerShell, mở PowerShell với quyền Administrator và chạy:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Sau đó bạn có thể sử dụng npm commands bình thường.

## Kiểm tra cài đặt

Sau khi cài đặt thành công, bạn sẽ thấy:
- Folder `node_modules/@tinymce` và `node_modules/tinymce` được tạo
- Folder `public/tinymce` chứa các files của TinyMCE

## Lưu ý

- Nếu sau khi cài đặt vẫn gặp lỗi, hãy restart dev server (`npm run dev`)
- Đảm bảo file `scripts/copy-tinymce.js` tồn tại và có thể chạy được
- Nếu script copy thất bại, bạn có thể copy thủ công từ `node_modules/tinymce` sang `public/tinymce`

