import type { Table } from "dexie";

import Dexie from "dexie";

export class EduPathDB extends Dexie {
    targets!: Table<Target, number>;
    scores!: Table<Score, number>;
    schedules!: Table<Schedule, number>;

    constructor() {
        super("EduPathDB");
        this.version(1).stores({
            targets: "++id, subject",
            scores: "++id, subject, exams, createdAt",
            schedules: "++id, subject, exam, timeHandle, dateHandle, startCheck, endCheck, status",
        });
    }
}
export const db = new EduPathDB();