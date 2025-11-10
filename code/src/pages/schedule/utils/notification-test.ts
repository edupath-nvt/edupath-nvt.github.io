import dayjs from "dayjs";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

import { t } from "src/i18n";

// ✅ Hàm test notification đơn giản (1 thông báo)
export async function testSingleNotification() {
    try {
        // 1. Kiểm tra quyền
        const permission = await LocalNotifications.requestPermissions();
        if (permission.display !== 'granted') {
            console.error('❌ Notification permission denied');
            return { success: false, error: 'Permission denied' };
        }

        // 2. Tạo thông báo test sau 5 giây
        const testTime = dayjs().add(5, 'second').toDate();
        const platform = Capacitor.getPlatform();

        const notification = {
            title: '🧪 Test Notification',
            body: `Test thông báo lúc ${dayjs(testTime).format('HH:mm:ss')}`,
            id: 999999, // ID test
            schedule: {
                at: testTime,
            },
            sound: platform === 'android' ? 'default' : undefined,
            smallIcon: 'ic_launcher',
            largeIcon: 'ic_launcher',
            iconColor: '#488AFF',
            attachments: platform === 'ios' ? [{
                id: 'icon',
                url: 'res://icon.png'
            }] : undefined,
            actionTypeId: 'TEST_NOTIFICATION',
            extra: {
                test: true,
                timestamp: Date.now(),
            },
        };

        await LocalNotifications.schedule({
            notifications: [notification]
        });

        console.log('✅ Test notification scheduled for:', testTime);
        return {
            success: true,
            scheduledAt: testTime,
            id: notification.id
        };

    } catch (error: any) {
        console.error('❌ Test notification error:', error);
        return { success: false, error: error.message };
    }
}

// ✅ Hàm test nhiều thông báo (giống thực tế)
export async function testMultipleNotifications() {
    try {
        // 1. Kiểm tra quyền
        const permission = await LocalNotifications.requestPermissions();
        if (permission.display !== 'granted') {
            console.error('❌ Notification permission denied');
            return { success: false, error: 'Permission denied' };
        }

        // 2. Tạo dữ liệu test
        const testSchedules: Schedule[] = [
            {
                type: 'study',
                subject: 'Toán',
                exam: 'Kiểm tra giữa kỳ',
                timeHandle: dayjs().add(10, 'second').toISOString(),
                studyTime: 45,
            },
            {
                type: 'self',
                subject: '',
                exam: '',
                timeHandle: dayjs().add(15, 'second').toISOString(),
                studyTime: 2,
            },
            {
                type: 'study',
                subject: 'Văn',
                exam: 'Ôn tập',
                timeHandle: dayjs().add(20, 'second').toISOString(),
                studyTime: 60,
            },
        ];

        const platform = Capacitor.getPlatform();

        // 3. Tạo notifications
        const notifications = testSchedules.map((s, index) => {
            const isSelf = s.type === 'self';
            const title = isSelf
                ? t('Personal Schedule')
                : t('Study Schedule: ${0}', s.subject);

            const body = isSelf
                ? t("Your personal activity starts at {0} ({1} hours)",
                    dayjs(s.timeHandle).format("HH:mm:ss"),
                    s.studyTime)
                : t("Start studying {0} ({1}) at {2} ({3} minutes)",
                    s.subject,
                    s.exam,
                    dayjs(s.timeHandle).format("HH:mm:ss"),
                    s.studyTime
                );

            return {
                title,
                body,
                id: 990000 + index, // Test IDs
                schedule: {
                    at: new Date(s.timeHandle),
                },
                sound: platform === 'android' ? 'default' : undefined,
                smallIcon: 'ic_launcher',
                largeIcon: 'ic_launcher',
                iconColor: '#488AFF',
                attachments: platform === 'ios' ? [{
                    id: 'icon',
                    url: 'res://icon.png'
                }] : undefined,
                actionTypeId: 'SCHEDULE_NOTIFICATION',
                extra: {
                    test: true,
                    scheduleId: 990000 + index,
                    type: s.type,
                    subject: s.subject,
                    exam: s.exam,
                },
            };
        });

        // 4. Schedule notifications
        await LocalNotifications.schedule({ notifications });

        console.log('✅ Test notifications scheduled:', notifications.length);
        notifications.forEach((n, i) => {
            console.log(`  ${i + 1}. ${n.title} at ${dayjs(n.schedule.at).format('HH:mm:ss')}`);
        });

        return {
            success: true,
            count: notifications.length,
            ids: notifications.map(n => n.id),
            schedules: notifications.map(n => ({
                id: n.id,
                title: n.title,
                time: n.schedule.at
            }))
        };

    } catch (error: any) {
        console.error('❌ Test multiple notifications error:', error);
        return { success: false, error: error.message };
    }
}

// ✅ Hàm test ngay lập tức (không có schedule)
export async function testImmediateNotification() {
    try {
        const permission = await LocalNotifications.requestPermissions();
        if (permission.display !== 'granted') {
            console.error('❌ Notification permission denied');
            return { success: false, error: 'Permission denied' };
        }

        const platform = Capacitor.getPlatform();
        const now = dayjs().add(1, 'second').toDate(); // 1 giây sau

        const notification = {
            title: '⚡ Immediate Test',
            body: 'Thông báo test ngay lập tức',
            id: 998888,
            schedule: {
                at: now,
            },
            sound: platform === 'android' ? 'default' : undefined,
            smallIcon: 'ic_launcher',
            largeIcon: 'ic_launcher',
            iconColor: '#FF5722',
            actionTypeId: 'IMMEDIATE_TEST',
            extra: {
                test: true,
                immediate: true,
            },
        };

        await LocalNotifications.schedule({
            notifications: [notification]
        });

        console.log('✅ Immediate notification scheduled');
        return { success: true, id: notification.id };

    } catch (error: any) {
        console.error('❌ Immediate notification error:', error);
        return { success: false, error: error.message };
    }
}

// ✅ Hàm kiểm tra pending notifications
export async function checkPendingNotifications() {
    try {
        const pending = await LocalNotifications.getPending();

        console.log('📋 Pending notifications:', pending.notifications.length);
        pending.notifications.forEach(n => {
            console.log(`  - ID: ${n.id}, Title: ${n.title}`);
        });

        return {
            success: true,
            count: pending.notifications.length,
            notifications: pending.notifications
        };

    } catch (error: any) {
        console.error('❌ Check pending error:', error);
        return { success: false, error: error.message };
    }
}

// ✅ Hàm xóa tất cả test notifications
export async function clearTestNotifications() {
    try {
        // Xóa các notification có ID test (99xxxx)
        const pending = await LocalNotifications.getPending();
        const testIds = pending.notifications
            .filter(n => n.id >= 990000 && n.id <= 999999)
            .map(n => n.id);

        if (testIds.length > 0) {
            await LocalNotifications.cancel({
                notifications: testIds.map(id => ({ id }))
            });
            console.log(`🗑️ Cleared ${testIds.length} test notifications`);
        } else {
            console.log('ℹ️ No test notifications to clear');
        }

        return { success: true, cleared: testIds.length };

    } catch (error: any) {
        console.error('❌ Clear notifications error:', error);
        return { success: false, error: error.message };
    }
}

// ✅ Hàm test với các platform khác nhau
export async function testPlatformSpecific() {
    const platform = Capacitor.getPlatform();

    console.log(`🔧 Testing on platform: ${platform}`);

    const config = {
        android: {
            smallIcon: 'ic_launcher',
            largeIcon: 'ic_launcher',
            iconColor: '#488AFF',
            sound: 'default',
        },
        ios: {
            attachments: [{
                id: 'icon',
                url: 'res://icon.png'
            }],
        },
        web: {
            icon: '/assets/icon.png',
        }
    };

    try {
        const permission = await LocalNotifications.requestPermissions();
        if (permission.display !== 'granted') {
            return { success: false, error: 'Permission denied' };
        }

        const notification = {
            title: `📱 Test on ${platform}`,
            body: `Platform-specific test for ${platform}`,
            id: 997777,
            schedule: {
                at: dayjs().add(5, 'second').toDate(),
            },
            actionTypeId: 'PLATFORM_TEST',
            extra: {
                platform,
                test: true,
            },
            ...(platform === 'android' && config.android),
            ...(platform === 'ios' && config.ios),
            ...(platform === 'web' && config.web),
        };

        await LocalNotifications.schedule({
            notifications: [notification]
        });

        console.log(`✅ Platform-specific test scheduled for ${platform}`);
        return { success: true, platform, id: notification.id };

    } catch (error: any) {
        console.error('❌ Platform test error:', error);
        return { success: false, error: error.message };
    }
}

// ✅ Type definition
interface Schedule {
    type: 'self' | 'study';
    subject: string;
    exam: string;
    timeHandle: string;
    studyTime: number;
}

// ✅ Hàm test tổng hợp - chạy tất cả tests
export async function runAllTests() {
    console.log('🚀 Starting all notification tests...\n');

    // Test 1: Single notification
    console.log('1️⃣ Testing single notification...');
    const test1 = await testSingleNotification();
    console.log('Result:', test1, '\n');

    // Đợi 2 giây
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Multiple notifications
    console.log('2️⃣ Testing multiple notifications...');
    const test2 = await testMultipleNotifications();
    console.log('Result:', test2, '\n');

    // Test 3: Check pending
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('3️⃣ Checking pending notifications...');
    const test3 = await checkPendingNotifications();
    console.log('Result:', test3, '\n');

    // Test 4: Platform specific
    console.log('4️⃣ Testing platform-specific...');
    const test4 = await testPlatformSpecific();
    console.log('Result:', test4, '\n');

    console.log('✅ All tests completed!\n');
    console.log('⚠️ Wait for notifications to appear...');
    console.log('💡 To clear test notifications, run: clearTestNotifications()');

    return {
        test1,
        test2,
        test3,
        test4,
    };
}