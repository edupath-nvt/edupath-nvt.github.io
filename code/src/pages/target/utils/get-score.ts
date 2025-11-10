import { red, green, orange } from "@mui/material/colors";

import { db } from "src/database/dexie";
import { Exams, ListExams } from "src/mock/default-data";

/**
 * Tính % đạt được của điểm thực tế (y) so với mục tiêu (x)
 * @param target  Điểm mục tiêu (x) - 0 đến 10
 * @param actual  Điểm thực tế (y) - 0 đến 10
 * @returns % đạt được (có thể >100% nếu vượt)
 */
export const percentAchieved = (target: number, actual: number): number => {
    // Bảo vệ đầu vào
    if (target <= 0) return actual > 0 ? Infinity : 100; // tránh chia 0
    if (actual < 0) return 0;

    const ratio = actual / target;
    return Math.round(ratio * 100 * 10) / 10; // làm tròn 1 chữ số thập phân
};

export const getScore = async () => {
    // === 1. Lấy dữ liệu song song ===
    const [scores, targets] = await Promise.all([db.scores.toArray(), db.targets.toArray()]);

    // === 2. Nhóm scores theo subject + exam ===
    const scoreMap = new Map<string, Map<Exams, number[]>>();

    for (const s of scores) {
        let subjectMap = scoreMap.get(s.subject);
        if (!subjectMap) {
            subjectMap = ListExams.reduce((map, exam) => map.set(exam, []), new Map<Exams, number[]>());
            scoreMap.set(s.subject, subjectMap);
        }
        subjectMap.get(s.exams)!.push(s.score);
    }

    // === 3. Tính điểm cho từng target ===
    return targets.map((tar) => {
        const subjectScores = scoreMap.get(tar.subject);

        const scoresByExam = subjectScores
            ? Object.fromEntries(ListExams.map((exam) => [exam, subjectScores.get(exam) ?? []]))
            : ListExams.reduce((map, exam) => {
                map[exam] = [];
                return map;
            }, {} as Record<Exams, []>);

        // === Tính điểm trung bình có trọng số (hiện tại) ===
        let totalWeightedScore = 0;  // Σ (avg × count × weight)
        let totalWeight = 0;         // Σ (count × weight)
        let missingWeight = 0;       // Σ weight của các kỳ chưa làm (ít nhất 1 bài/kỳ)

        ListExams.forEach((exam) => {
            const arr = scoresByExam[exam];
            const weight = Exams[exam].weight;
            const count = arr.length;

            if (count > 0) {
                const avg = arr.reduce((a, b) => a + b, 0) / count;
                totalWeightedScore += avg * count * weight;
                totalWeight += count * weight;
            } else {
                // Giả định: cần ít nhất 1 bài để tính
                missingWeight += weight;
            }
        });

        const currentAverage = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

        // === Tính điểm trung bình cần thiết ở các kỳ còn thiếu ===
        let requiredAvg: number = 0;

        if (missingWeight > 0) {
            const targetTotal = tar.target * (totalWeight + missingWeight);
            const neededFromMissing = targetTotal - totalWeightedScore;
            requiredAvg = neededFromMissing / missingWeight;
        }

        // === Tạo object exams chi tiết ===
        const exams = Object.fromEntries(
            ListExams.map((exam) => {
                const arr = scoresByExam[exam];
                const count = arr.length;
                const avg = count > 0 ? arr.reduce((a, b) => a + b, 0) / count : 0;
                return [
                    exam,
                    {
                        target: tar.exams[exam],
                        count,
                        weight: Exams[exam].weight,
                        avg: count > 0 ? avg : 0,
                        isMissing: count === 0,
                        percent: percentAchieved(tar.target, count > 0 ? avg : 0)
                    },
                ];
            })
        ) as Record<
            Exams,
            {
                target: number;
                count: number;
                weight: number;
                avg: number;
                isMissing: boolean;
                percent: number;
            }
        >;

        // === Kết quả trả về ===
        return {
            id: tar.id!,
            subject: tar.subject,
            target: tar.target,
            score: currentAverage, // điểm trung bình hiện tại
            exams,
            countExams: Object.values(exams).reduce((a, i) => a + i.count, 0),
            requiredAvg,           // điểm TB cần ở các kỳ còn thiếu (null nếu không còn thiếu)
            missingExams: ListExams.filter((exam) => scoresByExam[exam].length === 0),
            color: requiredAvg > 10 ? red[500] : requiredAvg > tar.target ? orange[500] : green[500],
        };
    });
};

export const getScoreBySubject = async (exams: Exams, subject: Subjects) => {
    if (!subject || !exams) return { scores: [] as Score[], totalScore: 0 };
    const scores = await db.scores.where({ subject, exams }).toArray();
    const totalScore = (await db.targets.where({ subject }).first())?.exams[exams];
    return { scores, totalScore };
}

export type getScoreBySubject = Awaited<ReturnType<typeof getScoreBySubject>>

export type TargetValue = Awaited<ReturnType<typeof getScore>>[number];