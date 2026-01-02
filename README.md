# Edupath - Ứng dụng Quản lý Giáo dục

Edupath là một ứng dụng web hiện đại được xây dựng bằng React 19, Vite và tích hợp Capacitor để chạy trên các nền tảng di động (Android/iOS).

## 🚀 Công nghệ sử dụng

- **Frontend**: React 19, TypeScript, Vite
- **Giao diện**: MUI (Material UI), Emotion, Iconify
- **Quản lý trạng thái**: Zustand, Dexie.js (IndexedDB)
- **Runtime**: Bun (Khuyên dùng) hoặc Node.js
- **Mobile**: Capacitor 7

---

## 🛠 Yêu cầu hệ thống

Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt:

1.  **Bun**: [Hướng dẫn cài đặt Bun](https://bun.sh/) (Cực kỳ khuyến khích vì tốc độ nhanh).
2.  **Node.js**: Nếu không dùng Bun.
3.  **Android Studio**: Để build ứng dụng Android.
4.  **Java SDK**: Tương thích với yêu cầu của Android Studio (thường là Java 17).

---

## 📦 Cài đặt

Mở terminal tại thư mục gốc của dự án và chạy lệnh sau:

```bash
# Sử dụng Bun (Nhanh nhất)
bun install

# Hoặc sử dụng npm
npm install
```

---

## 💻 Chạy môi trường phát triển (Web)

Để chạy ứng dụng trên trình duyệt trong quá trình phát triển:

```bash
bun dev
```

Ứng dụng sẽ chạy tại địa chỉ mặc định: `http://localhost:5173`

---

## 🏗 Build ứng dụng Web

Để tạo bản build sản phẩm (production) cho web:

```bash
# Build ra thư mục /dist
bun run build
```

---

## 📱 Build và Chạy ứng dụng Android với Capacitor

Để chạy ứng dụng trên thiết bị Android hoặc máy ảo:

### Bước 1: Build ứng dụng Web & Đồng bộ dữ liệu

Lệnh này sẽ build code React và đồng bộ thư mục `dist` vào mã nguồn Android gốc:

```bash
bun run build:android
```

### Bước 2: Mở dự án trong Android Studio

Mở Android Studio để thực hiện việc chạy trên máy thật hoặc tạo file APK:

```bash
bunx cap open android
```

### Bước 3: Chạy Ứng dụng

Trong Android Studio:

1.  Chờ Gradle đồng bộ (Sync) xong.
2.  Kết nối điện thoại Android (đã bật USB Debugging) hoặc chọn một Máy ảo (Emulator).
3.  Nhấn nút **Run** (biểu tượng Play màu xanh) trên thanh công cụ để cài đặt và chạy ứng dụng.

### Bước 4: Cập nhật code sau khi chỉnh sửa

Mỗi khi bạn thay đổi code React và muốn thấy thay đổi trên điện thoại, hãy chạy lại lệnh build và sync:

```bash
# Build lại web và copy sang android
bun run build:android
```

---

## 📝 Các lệnh hữu ích khác

- `bun run lint`: Kiểm tra lỗi code.
- `bun run lint:fix`: Tự động sửa lỗi code.
- `bun run build:ios`: Build và đồng bộ cho ứng dụng iOS (Yêu cầu macOS và Xcode).
