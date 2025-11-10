import dayjs from "dayjs";
import { useLiveQuery } from "dexie-react-hooks";

import { db } from "src/database/dexie";

export function useSchedule(mode: "day" | "week" | "month") {
    const data = useLiveQuery(async () => {

        const all = await db.schedules.filter((e) => {
            if (mode === "day") return dayjs(e.timeHandle).isSame(dayjs(), "day");
            if (mode === "week") return dayjs(e.timeHandle).isSame(dayjs(), "week");
            if (mode === "month") return dayjs(e.timeHandle).isSame(dayjs(), "month");
            return false
        }).toArray();
        const grouped = all.reduce<Record<string, typeof all>>((acc, cur) => {
            const dayKey = dayjs(cur.timeHandle).format("DD MMM YYYY")
            if (!acc[dayKey]) acc[dayKey] = [];
            acc[dayKey].push(cur);
            return acc;
        }, {});
        return grouped;
    }, [mode])

    return { data }
}