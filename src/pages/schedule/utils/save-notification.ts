import dayjs from "dayjs";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

import { t } from "src/i18n";

export async function saveNotification(lst: Schedule[]) {
    const permission = await LocalNotifications.requestPermissions();
    if (permission.display !== 'granted') {
        throw new Error('Notification permission denied');
    }

    const platform = Capacitor.getPlatform();
    if (["android", "ios", "web"].includes(platform)) {

        const notifications = lst.map((s) => {
            const isSelf = s.type === 'self';
            const title = isSelf
                ? t('Personal Schedule')
                : t('Study Schedule: {{s}}', { s: s.subject });

            const body = isSelf
                ? t("Your personal activity starts at {{time}} ({{hours}} hours)", {
                    time: dayjs(s.timeHandle).format("HH:mm, dddd"),
                    hours: s.studyTime,
                })
                : t("Start studying {{subject}} ({{exam}}) at {{time}} ({{hours}} hours)", {
                    subject: s.subject,
                    exam: s.exam,
                    time: dayjs(s.timeHandle).format("HH:mm, dddd"),
                    hours: s.studyTime,
                });

            return {
                title,
                body,
                id: s.id!,
                schedule: {
                    at: dayjs(s.timeHandle).toDate(),
                },
                sound: platform === 'android' ? 'default' : undefined,

                // ✅ Thêm icon
                smallIcon: 'ic_stat_icon_config_sample', // Android
                largeIcon: 'res://drawable/notification_icon', // Android
                iconColor: '#488AFF', // Android - màu icon
                attachments: platform === 'ios' ? [{
                    id: 'icon',
                    url: 'res://icon.png' // iOS
                }] : undefined,

                // ✅ Thêm actionTypeId để xử lý click
                actionTypeId: 'SCHEDULE_NOTIFICATION',

                // ✅ Thêm extra data
                extra: {
                    id: s.id,
                },
            };
        });

        await LocalNotifications.schedule({ notifications });
    }
}

export async function Schedule(props: {
    title: string;
    body: string;
    at: Dayjs;
    id: number;
}) {
    const platform = Capacitor.getPlatform();
    await LocalNotifications.schedule({
        notifications: [{
            title: props.title,
            body: props.body,
            id: props.id,
            schedule: {
                at: props.at.toDate(),
            },
            smallIcon: 'ic_stat_icon_config_sample', // Android
            largeIcon: 'res://drawable/notification_icon', // Android
            iconColor: '#488AFF', // Android - màu icon
            attachments: platform === 'ios' ? [{
                id: 'icon',
                url: 'res://icon.png' // iOS
            }] : undefined,

            // ✅ Thêm actionTypeId để xử lý click
            actionTypeId: 'SCHEDULE_NOTIFICATION',

            // ✅ Thêm extra data
            extra: {
                id: props.id,
            },
        }]
    });
}

export async function cancelNotification(id: number) {
    const platform = Capacitor.getPlatform();
    if (["android", "ios", "web"].includes(platform)) {
        await LocalNotifications.cancel({
            notifications: [{ id }],
        });
    }
}