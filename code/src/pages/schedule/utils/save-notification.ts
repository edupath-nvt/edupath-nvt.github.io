import dayjs from "dayjs";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

import { t } from "src/i18n";
import { db } from "src/database/dexie";

export async function saveNotification(lst: Schedule[]) {
    const permission = await LocalNotifications.requestPermissions();
    if (permission.display !== 'granted') {
        throw new Error('Notification permission denied');
    }

    const keys = await db.schedules.bulkAdd(lst, {
        allKeys: true,
    });

    const platform = Capacitor.getPlatform();
    if (["android", "ios", "web"].includes(platform)) {

        const notifications = lst.map((s, index) => {
            const isSelf = s.type === 'self';
            const title = isSelf
                ? t('Personal Schedule')
                : t('Study Schedule: ${0}', s.subject);

            const body = isSelf
                ? t("Your personal activity starts at {0} ({1} hours)",
                    dayjs(s.timeHandle).format("HH:mm, dddd"),
                    s.studyTime)
                : t("Start studying {0} ({1}) at {2} ({3} hours)",
                    s.subject,
                    s.exam,
                    dayjs(s.timeHandle).format("HH:mm, dddd"),
                    s.studyTime
                );

            return {
                title,
                body,
                id: dayjs(s.timeHandle).subtract(5, 'minute').unix(),
                schedule: {
                    at: dayjs(s.timeHandle).subtract(5, 'minute').toDate(),
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
                    id: keys[index],
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
    id?: number;
}) {
    const platform = Capacitor.getPlatform();
    await LocalNotifications.schedule({
        notifications: [{
            title: props.title,
            body: props.body,
            id: props.at.unix(),
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