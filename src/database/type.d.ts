type Target = {
    id?: number;
    subject: Subjects;
    exams: Record<Exams, number>[];
    target: number;
}

type Score = {
    id?: number;
    subject: Subjects;
    exams: Exams;
    score: number;
    semester: number;
    createdAt: string;
    updatedAt: string;
}

type Schedule = {
    id?: number;
    type: "subject" | "self";
    subject?: Subjects;
    exam?: Exams;
    status: 'canceled' | 'new';
    timeHandle: Date;
    studyTime: number;
    startCheck?: Date;

    title?: string;
    body?: string;
}

type TargetDatabase = {
    id?: number
    name: string
    target: {
        targets: Target[]
        scores: Score[]
        schedules: Schedule[]
    }
    md5: string
    time: number
}