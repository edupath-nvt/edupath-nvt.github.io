// hoặc router của bạn
import { LocalNotifications } from '@capacitor/local-notifications';

export function setupNotificationListeners() {
    // ✅ Xử lý khi click vào thông báo
    LocalNotifications.addListener(
        'localNotificationActionPerformed',
        (notification) => {
            console.log('Notification clicked:', notification);

            const { scheduleId, type } = notification.notification.extra;

            // Điều hướng đến trang chi tiết
            if (type === 'self') {
                // Chuyển đến lịch cá nhân
                window.location.href = `/schedule/${scheduleId}`;
            } else {
                // Chuyển đến lịch học
                window.location.href = `/study/${scheduleId}`;
            }

            // Hoặc dùng React Router
            // history.push(`/schedule/${scheduleId}`);
        }
    );

    // ✅ Xử lý khi nhận thông báo (app đang mở)
    LocalNotifications.addListener(
        'localNotificationReceived',
        (notification) => {
            console.log('Notification received:', notification);
            // Có thể hiển thị toast hoặc cập nhật UI
        }
    );
}
