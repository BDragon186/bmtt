

# ĐỒ ÁN MÔN HỌC

## Báo cáo Kỹ thuật và Trình diễn Cuối kỳ

**Môn học:** Introduction to Information Security  
**Giảng viên:** Huỳnh Ngọc Tú

---

### 1. Thông tin Dự án

**Đề tài:**  
VulnAuthLab — Web Security Demo Lab: SQL Injection & NoSQL Injection Authentication Bypass

**Thành viên nhóm (Họ tên và MSSV):**

* [Điền thông tin thành viên]
* [Điền thông tin thành viên]

**Đường dẫn Repository:**  
[Điền link GitHub/GitLab]

---

### 2. Tóm tắt Dự án

VulnAuthLab là một ứng dụng web mô phỏng các lỗ hổng bảo mật SQL Injection và NoSQL Injection nhằm phục vụ mục đích học tập và nghiên cứu an toàn thông tin. Hệ thống cho phép người dùng trực tiếp thực hiện các kỹ thuật Authentication Bypass thông qua việc thao túng HTTP Request và phân tích cơ chế xử lý dữ liệu không an toàn tại Backend.

Ứng dụng được xây dựng với hai chế độ hoạt động gồm Vulnerable Mode (môi trường chứa lỗ hổng) và Secure Mode (môi trường đã áp dụng biện pháp phòng vệ), giúp so sánh trực tiếp giữa insecure coding và secure coding. Hệ thống đồng thời tích hợp các thành phần hỗ trợ trực quan hóa như Live Query Console, Raw HTTP Request Viewer và Attack Logs để hỗ trợ phân tích quá trình khai thác lỗ hổng.

Trong phần trình diễn thực tế, nhóm sử dụng Burp Suite để chặn bắt và chỉnh sửa HTTP Request nhằm bypass cơ chế xác thực bằng payload SQL Injection và NoSQL Injection. Sau đó, hệ thống được kiểm thử lại trên Secure Mode để chứng minh hiệu quả của các biện pháp phòng chống như Parameterized Query và Input Type Validation.

---

### 3. Môi trường Lab và Thiết lập Công cụ

#### 3.1. Phần cứng và Máy ảo

Hệ thống yêu cầu máy tính cá nhân chạy Windows 10/11, kết hợp với máy ảo Kali Linux sử dụng cho Burp Suite và kiểm thử bảo mật. Cấu hình RAM đề xuất tối thiểu là 8GB để đảm bảo hiệu năng vận hành.

#### 3.2. Phần mềm và Thư viện

Về mặt kỹ thuật, **Frontend** được xây dựng bằng HTML, CSS và JavaScript. **Backend** sử dụng nền tảng Node.js với framework Express.js. **Cơ sở dữ liệu** tích hợp better-sqlite3, mongodb-memory-server và MongoDB Native Driver. Các **Công cụ kiểm thử bảo mật** bao gồm Burp Suite Community Edition và Kali Linux. Ngoài ra, dự án còn sử dụng Visual Studio Code và Git/GitHub trong quá trình phát triển.

#### 3.3. Cấu hình Mạng

Hệ thống được triển khai trong môi trường local laboratory với cấu hình cụ thể:

* **Web Server:** http://localhost:3000
* **Burp Proxy:** 127.0.0.1:8080

Browser Proxy được cấu hình chuyển tiếp qua Burp Suite để thực hiện các thao tác chặn và chỉnh sửa HTTP Request.

---

### 4. Triển khai Cốt lõi và Phân tích Mã nguồn

#### 4.1. Kiến trúc và Luồng Logic

Hệ thống được xây dựng theo mô hình Client-Server. Frontend gửi HTTP Request đến Backend thông qua các API RESTful. Backend xử lý dữ liệu đầu vào và thực hiện truy vấn trên SQLite hoặc MongoDB tùy theo chế độ được chọn.

**Luồng xử lý tổng quát:**
Người dùng nhập thông tin đăng nhập trên giao diện web, sau đó Frontend gửi HTTP POST Request đến Express Server. Express middleware thực hiện parsing dữ liệu request body trước khi Controller xử lý logic xác thực. Backend sẽ truy vấn SQLite hoặc MongoDB và trả kết quả về frontend. Toàn bộ request và query được ghi lại vào Attack Logs.

Hệ thống chia thành hai nhóm endpoint: **Vulnerable Mode** (mô phỏng lỗ hổng Injection) và **Secure Mode** (áp dụng cơ chế phòng vệ), cho phép đối chiếu trực tiếp giữa hai phương pháp lập trình.

#### 4.2. Giải thích các phân đoạn mã nguồn chính

**a. Middleware Parsing và Tác động bảo mật**

```javascript
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

Middleware `express.json()` chịu trách nhiệm phân tích HTTP Request Body định dạng JSON và chuyển đổi thành JavaScript Object. Đây là thành phần cực kỳ quan trọng đối với NoSQL Injection. Nếu middleware này không tồn tại, payload object injection sẽ không được parse đúng cách, khiến lỗ hổng không thể khai thác. MongoDB Native Driver sẽ diễn giải các object này như một query operator hợp lệ, tạo điều kiện cho Object Injection xảy ra.

**b. Mã nguồn chứa lỗ hổng SQL Injection**

```javascript
const query =
`SELECT * FROM users
WHERE username='${username}'
AND password='${password}'`;

const user = sqliteDb.prepare(query).get();
```

Backend xây dựng câu truy vấn bằng phương pháp nối chuỗi (string concatenation). Dữ liệu đầu vào từ người dùng được nối trực tiếp vào cú pháp SQL mà không qua bước kiểm tra nào. Attacker có thể sử dụng payload `' OR 1=1 --` để khiến biểu thức luôn đúng và vô hiệu hóa phần kiểm tra mật khẩu bằng ký tự comment `--`, từ đó bypass cơ chế xác thực.

**c. Mã nguồn an toàn chống SQL Injection**

```javascript
const queryStr =
"SELECT * FROM users WHERE username=? AND password=?";

const stmt = sqliteDb.prepare(queryStr);
const user = stmt.get(username, password);
```

Hệ thống sử dụng **Parameterized Query**. Trong cơ chế này, cấu trúc SQL được biên dịch trước và dữ liệu được bind sau. Payload của attacker sẽ chỉ được xem là dữ liệu chuỗi thông thường thay vì một phần của cấu trúc lệnh SQL.

**d. Mã nguồn chứa lỗ hổng NoSQL Injection**

```javascript
const user = await db.collection('users').findOne({
  username,
  password
});
```

Backend nhận trực tiếp object JSON từ request và truyền thẳng vào MongoDB query. Attacker có thể thay đổi cấu trúc dữ liệu thành các toán tử như `{"$ne": null}`. MongoDB sẽ diễn giải điều kiện này là "khác null", dẫn đến việc trả về tài khoản đầu tiên trong cơ sở dữ liệu và hoàn tất quá trình bypass.

**e. Mã nguồn an toàn chống NoSQL Injection**

```javascript
if (
  typeof username !== 'string' ||
  typeof password !== 'string'
) {
  return res.status(400).json({
    success: false,
    error: "Invalid input type"
  });
}
```

Cơ chế phòng vệ ở đây là thực hiện **Input Type Validation**. Bằng cách kiểm tra kiểu dữ liệu phải là `string`, hệ thống sẽ chặn đứng các nỗ lực Object Injection ngay từ middleware trước khi lệnh truy vấn được thực thi.

**f. Hệ thống Ghi nhật ký Tấn công (Attack Logging System)**

```javascript
logAttack({
  ip: req.ip,
  endpoint: '/sql/vulnerable/login',
  payload: { username, password },
  query: query,
  result: bypassed ? 'BYPASS' : 'FAIL'
});
```

Hệ thống ghi lại địa chỉ IP, endpoint, payload, câu truy vấn thực tế và kết quả xử lý. Điều này hỗ trợ đắc lực cho việc phân tích hành vi, phát hiện bất thường và phục vụ công tác điều tra số (forensic analysis).

**g. Lý do sử dụng MongoDB Native Driver**
Nhóm chuyển từ Mongoose sang MongoDB Native Driver vì Mongoose có cơ chế tự động ép kiểu và kiểm tra schema, điều này vô tình ngăn chặn các hành vi gốc của NoSQL Injection, làm giảm tính thực tế trong việc mô phỏng lỗ hổng tại môi trường nghiên cứu.

---

### 5. Quy trình Trình diễn Chi tiết

* **Bước 1: Khởi tạo:** Khởi động Express Server và truy cập giao diện. Database SQLite và MongoDB in-memory sẽ tự động được thiết lập cùng các tài khoản mẫu.
* **Bước 2: Đăng nhập thông thường:** Sử dụng tài khoản `admin`/`admin123` để xác nhận hệ thống hoạt động ổn định trong điều kiện bình thường.
* **Bước 3: Tấn công SQL Injection:** Sử dụng Burp Suite để thay đổi trường username thành `' OR 1=1 --` và thực hiện bypass thành công.
* **Bước 4: Tấn công NoSQL Injection:** Chỉnh sửa request body thành các object chứa toán tử `{"$ne": null}` để vượt qua xác thực MongoDB.
* **Bước 5: Kiểm chứng trên Chế độ An toàn (Secure Mode):** Thực hiện lại các payload trên tại Secure Mode để chứng minh các yêu cầu độc hại đều bị chặn đứng.

---

### 6. Vá lỗ hổng và Cơ chế Phòng vệ

#### 6.1. Phòng chống SQL Injection

Hệ thống áp dụng Parameterized Query để tách biệt hoàn toàn giữa cấu trúc lệnh và dữ liệu người dùng, ngăn chặn việc thay đổi cú pháp truy vấn.

#### 6.2. Phòng chống NoSQL Injection

Backend thực hiện kiểm tra nghiêm ngặt kiểu dữ liệu đầu vào, chỉ chấp nhận kiểu chuỗi (string) để loại bỏ hoàn toàn khả năng Object Injection.

#### 6.3. Các cải thiện bảo mật bổ sung

Trong môi trường thực tế, cần triển khai thêm các biện pháp như: HTTPS, băm mật khẩu bằng bcrypt, quản lý Session an toàn, bảo vệ chống CSRF, giới hạn tốc độ truy cập (Rate Limiting), và sử dụng tường lửa ứng dụng web (WAF).

---

### 7. Kết luận và Hạn chế

#### 7.1. Thách thức Kỹ thuật

Thách thức lớn nhất là việc tái hiện chính xác lỗ hổng NoSQL Injection do các thư viện hiện đại thường tích hợp sẵn các lớp bảo vệ tự động. Việc chuyển sang Native Driver là quyết định then chốt để mô phỏng chính xác lý thuyết tấn công.

#### 7.2. Hạn chế

Hệ thống hiện chỉ vận hành trong môi trường phòng thí nghiệm, chưa triển khai các chuẩn bảo mật production như HTTPS, băm mật khẩu hay cơ chế chống brute-force.

#### 7.3. Hướng phát triển tương lai

Dự án có thể mở rộng thêm các loại hình tấn công khác như XSS, CSRF, lỗ hổng JWT và Command Injection để trở thành một nền tảng học tập bảo mật toàn diện.

---

### 8. Tài liệu Tham khảo và Ghi nhận

1. **OWASP SQL Injection Documentation:** https://owasp.org/www-community/attacks/SQL_Injection
2. **OWASP NoSQL Injection Documentation:** https://owasp.org/www-community/attacks/NoSQL_Injection
3. **Express.js Documentation:** https://expressjs.com/
4. **MongoDB Query Operators:** https://www.mongodb.com/docs/manual/reference/operator/query/
5. **Burp Suite Documentation:** https://portswigger.net/burp/documentation
6. **better-sqlite3 Documentation:** https://github.com/WiseLibs/better-sqlite3
7. **OpenAI ChatGPT:** Được sử dụng để hỗ trợ viết báo cáo và phân tích kỹ thuật.
