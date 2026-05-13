# VulnAuthLab

Một ứng dụng web được cố tình thiết kế có lỗ hổng nhằm phục vụ mục đích học thuật và demo hai hình thức tấn công: **SQL Injection** và **NoSQL Injection** Authentication Bypass.

> **Cảnh báo:** Dự án này chứa mã nguồn có lỗ hổng bảo mật và CHỈ DÀNH CHO MỤC ĐÍCH HỌC TẬP. TUYỆT ĐỐI KHÔNG triển khai (deploy) ứng dụng này lên các máy chủ công khai.

## Tính năng

- **Hỗ trợ 2 Database:** Trình diễn cách tấn công Injection trên cả SQL (SQLite) và NoSQL (MongoDB In-Memory).
- **Chế độ Vulnerable & Secure:** Có thể chuyển đổi qua lại giữa chế độ có lỗ hổng (Vulnerable) và an toàn (Secure) theo thời gian thực để so sánh.
- **Giao diện Dark Cyberpunk:** UI mang phong cách cyberpunk/terminal với hiệu ứng glitch và màn hình CRT.
- **Live Query Console:** Hiển thị trực tiếp câu lệnh SQL hoặc object truy vấn MongoDB mà backend thực sự đang thực thi.
- **Raw HTTP Request Viewer:** Mô phỏng lại dạng HTTP Request gốc (giống như xem trong Burp Suite) ngay trên giao diện để dễ quan sát payload.
- **Attack Logs:** Ghi lại lịch sử các nỗ lực tấn công, nội dung payload và kết quả theo thời gian thực.

## Hướng dẫn cài đặt

1. **Cài đặt thư viện:**
   
   ```bash
   npm install
   ```

2. **Khởi chạy Server:**
   
   ```bash
   npm start
   ```

3. **Truy cập ứng dụng:**
   Mở trình duyệt và truy cập vào địa chỉ: `http://localhost:3000`

## Kịch bản Demo (Walkthrough)

### Phase 1: Đăng nhập bình thường

1. Chọn "SQL MODE" và "SECURE".
2. Nhập `admin` vào ô Username và `admin123` vào ô Password.
3. Quan sát kết quả đăng nhập thành công.

### Phase 2: SQL Injection

1. Chuyển sang chế độ "VULNERABLE".
2. Tại ô Username, nhập payload: `' OR 1=1 --` và nhập bất kỳ ký tự nào vào ô Password.
3. Nhấn "[ EXECUTE LOGIN ]".
4. Quan sát hiệu ứng Glitch, thông báo "ACCESS GRANTED (BYPASSED)", và xem câu truy vấn đã bị tiêm mã (inject) trong bảng Query Console.
5. Chuyển lại sang chế độ "SECURE", thử nhập lại đúng payload đó và quan sát kết quả bị từ chối nhờ cơ chế Parameterized Queries.

### Phase 3: NoSQL Injection

1. Chuyển hệ thống sang "NoSQL MODE".
2. Chọn chế độ "VULNERABLE".
3. Tại ô Username, nhập payload dạng object: `{"$ne": null}`
4. Tại ô Password, nhập payload dạng object: `{"$ne": null}`
5. Nhấn "[ EXECUTE LOGIN ]".
6. Quan sát kết quả Bypass thành công. Lý do là vì backend đang sử dụng Native MongoDB driver và truyền trực tiếp object truy vấn vào hàm `findOne`.
7. Chuyển sang chế độ "SECURE", thử lại payload trên. Lần này request sẽ bị chặn ngay từ đầu do backend đã kiểm tra chặt chẽ kiểu dữ liệu (chỉ cho phép `string`).

### Kết hợp bắt Request bằng Burp Suite

- Thiết lập Proxy trên trình duyệt trỏ về `127.0.0.1:8080` (hoặc cổng cấu hình của Burp).
- Bắt (Intercept) các request gửi đến `POST /sql/vulnerable/login` hoặc `POST /nosql/vulnerable/login`.
- **Lưu ý quan trọng cho NoSQL:** Hãy chắc chắn header `Content-Type` được đặt là `application/json` và bạn chỉnh sửa trực tiếp JSON payload. (Ví dụ: thay đổi `"password": "123"` thành `"password": {"$ne": null}`). Middleware `express.json()` bắt buộc phải parse thành công JSON object thì lỗi NoSQL Injection mới được kích hoạt.
