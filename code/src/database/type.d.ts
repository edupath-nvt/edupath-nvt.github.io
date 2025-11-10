type Target = {
    id?: number;
    subject: Subjects;
    exams: Record<Exams, number>;
    target: number;
}

type Score = {
    id?: number;
    subject: Subjects;
    exams: Exams;
    score: number;
    createdAt: string;
    updatedAt: string;
}

type Schedule = {
    id?: number;
    subject: Subjects;
    exam: Exams;
    status: 'studing' | 'finished' | 'canceled' | 'new';
    timeHandle: Date;
    studyTime: number;
    type: "subject" | "self";
    startCheck?: Date;
}