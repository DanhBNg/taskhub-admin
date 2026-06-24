# TaskHub Admin

TaskHub Admin là giao diện web quản trị dành cho hệ thống TaskHub AI. Ứng dụng được xây dựng bằng React + Vite, đăng nhập bằng Firebase Authentication và gọi các API quản trị từ backend để theo dõi người dùng, dự án và công việc.

## Chức năng chính

- Đăng nhập bằng tài khoản có quyền admin
- Xem thống kê tổng quan của hệ thống
- Xem danh sách người dùng, dự án và task
- Cập nhật `systemRole` cho người dùng
- Cập nhật trạng thái dự án từ giao diện quản trị

## Công nghệ sử dụng

- React
- Vite
- Firebase Authentication
- Backend API của TaskHub

## Cấu hình môi trường

Tạo file `.env.local` trong thư mục gốc và cấu hình:

```env
VITE_BACKEND_BASE_URL=[đường dẫn backend deploy]
```

Nếu không cấu hình, ứng dụng sẽ sử dụng giá trị mặc định đang được khai báo trong `src/api/adminApi.js`.

## Chạy local

```bash
npm install
npm run dev
```

## Build production

```bash
npm run build
npm run preview
```

## Điều kiện để đăng nhập admin

Tài khoản đăng nhập phải có document tương ứng trong collection `USERS` với trường:

```text
systemRole: "admin"
```

Sau khi đăng nhập, frontend sẽ lấy Firebase ID token và gửi token này qua header `Authorization: Bearer <token>` khi gọi các API quản trị.

## Cấu trúc thư mục chính

```text
src/
  api/adminApi.js   # Gọi API quản trị từ backend
  firebase.js       # Cấu hình Firebase cho frontend
  App.jsx           # Giao diện và luồng quản trị chính
  styles.css        # Giao diện dashboard admin
```

## Liên kết hệ thống

Repo này là thành phần web admin, đi kèm với:

- ứng dụng người dùng Flutter: `AI-TaskHub`
- backend xử lý AI và API quản trị: `taskhub-backend`
