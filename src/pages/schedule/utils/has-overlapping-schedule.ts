import dayjs from "dayjs";

import { db } from "src/database/dexie";

function isOverlapping(
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date
): boolean {
    return start1 < end2 && start2 < end1;
}

function getEndTime(timeHandle: Date, studyTime: number): Date {
    return dayjs(timeHandle).add(studyTime, 'hour').toDate();
}
export async function hasOverlappingSchedule(newSchedules: Schedule[]): Promise<boolean[]> {
    const existingSchedules = await db.schedules.filter(s =>
        s.status === 'new' &&
        dayjs(s.timeHandle).isSameOrAfter(dayjs(), 'day')
    ).toArray();

    const results: boolean[] = [];

    for (const newSch of newSchedules) {
        if (newSch.studyTime == null) {
            results.push(false);
            continue;
        }

        const newStart = newSch.timeHandle;
        const newEnd = getEndTime(newStart, newSch.studyTime);

        let hasOverlap = false;
        for (const oldSch of existingSchedules) {
            if (oldSch.id === newSch.id || oldSch.studyTime == null) continue;

            const oldStart = oldSch.timeHandle;
            const oldEnd = getEndTime(oldStart, oldSch.studyTime);

            if (isOverlapping(newStart, newEnd, oldStart, oldEnd)) {
                hasOverlap = true;
                break;
            }
        }

        results.push(hasOverlap);
    }

    return results;
}

export async function checkScheduleConflict(
    timeHandle: Date,
    studyTime: number
): Promise<boolean> {
    const newStart = timeHandle;
    const newEnd = getEndTime(newStart, studyTime);

    // Lấy tất cả lịch 'subject' từ DB
    const existingSchedules = await db.schedules.filter(s =>
        s.status === 'new' &&
        dayjs(s.timeHandle).isSameOrAfter(dayjs(), 'day')
    ).toArray();

    // Kiểm tra từng lịch cũ
    for (const old of existingSchedules) {
        const oldStart = old.timeHandle;
        const oldEnd = getEndTime(oldStart, old.studyTime);

        if (isOverlapping(newStart, newEnd, oldStart, oldEnd)) {
            return true; // Có xung đột
        }
    }

    return false; // Không xung đột
}