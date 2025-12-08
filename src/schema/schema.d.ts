
interface Schema {
    subject: Subjects,
    target: number,
    targets: {
        semester: 1 | 2,
        exam: Exams,
        target: number
        score: number,
        date: string
    }[]
}