
import { db } from "src/database/dexie";
import { Subjects } from "src/mock/default-data";

export async function getSubject() {
    const target = new Set((await db.targets.toArray()).map((tar) => tar.subject))
    return Object.keys(Subjects).filter((subject) => !target.has(subject as Subjects)) as Subjects[];
}