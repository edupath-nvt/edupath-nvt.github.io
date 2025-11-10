
import {
    red, blue, pink,
    cyan,
    lime,
    teal,
    green,
    amber,
    brown,
    yellow,
    indigo,
    orange,
    purple,
    blueGrey,
    deepOrange,
    lightGreen,
    deepPurple
} from "@mui/material/colors";


export const Subjects = {
    "Toán": {
        name: 'Toán học',
        color: indigo[500],
        icon: "solar:calculator-linear"
    },
    "Văn": {
        name: 'Ngữ văn',
        color: pink[400],
        icon: "solar:notebook-bookmark-linear"
    },
    "Anh": {
        name: 'Tiếng Anh',
        color: blue[400],
        icon: "mage:message-dots-round"
    },
    "Sử": {
        name: 'Lịch sử',
        color: deepOrange[400],
        icon: "solar:hourglass-line-duotone"
    },
    "GDTC": {
        name: 'Giáo dục thể chất',
        color: green[500],
        icon: "solar:running-linear"
    },
    'QP&AN': {
        name: 'Giáo dục quốc phòng và an ninh',
        color: teal[500],
        icon: "solar:shield-check-linear"
    },
    "Lý": {
        name: 'Vật lý',
        color: purple[500],
        icon: "solar:atom-linear"
    },
    "Hóa": {
        name: 'Hóa học',
        color: cyan[500],
        icon: "solar:test-tube-linear"
    },
    "Sinh": {
        name: 'Sinh học',
        color: lightGreen[500],
        icon: "solar:dna-linear"
    },
    "Địa": {
        name: 'Địa lý',
        color: amber[500],
        icon: "solar:earth-linear"
    },
    'KT&PL': {
        name: 'Kinh tế và Pháp luật',
        color: brown[500],
        icon: "solar:scale-linear"
    },
    'Tin': {
        name: 'Tin học',
        color: blueGrey[500],
        icon: "solar:chat-square-code-linear"
    },
    'CNNN': {
        name: 'Công nghệ Nông nghiệp',
        color: deepPurple[400],
        icon: "solar:leaf-linear"
    },
    'CNCN': {
        name: 'Công nghệ Chăn nuôi',
        color: orange[500],
        icon: "solar:paw-linear"
    },
    'TN-HN': {
        name: 'Hoạt động trải nghiệm, hướng nghiệp + Nội dung giáo dục địa phương',
        color: lime[600],
        icon: "solar:compass-linear"
    },
    'Âm nhạc': {
        name: 'Âm nhạc',
        color: red[400],
        icon: "solar:music-note-linear"
    },
    'Mỹ thuật': {
        name: 'Mỹ thuật',
        color: purple[300],
        icon: "solar:paint-roller-linear"
    },
};

export const Exams = {
    "Thường xuyên": {
        weight: 1,
        color: cyan[600],
        icon: "solar:hand-heart-bold-duotone",
    },
    "Giữa kỳ": {
        weight: 2,
        color: green[600],
        icon: "solar:hand-pills-bold-duotone",
    },
    "Cuối kỳ": {
        weight: 3,
        color: yellow[600],
        icon: "solar:hand-stars-bold-duotone"
    }
}


export const ListExams = Object.keys(Exams) as Exams[];
export const ListSubjects = Object.keys(Subjects) as Subjects[];

const counts = [4, 2, 1]

export const defaultAddTarget = (subject: Subjects) => ({
    id: undefined,
    target: 8,
    exams: ListExams.reduce((acc, exam, index) => ({ ...acc, [exam]: counts[index] }), {} as Record<Exams, number>),
    subject,
})

declare global {
    type Subjects = keyof typeof Subjects;
    type Exams = keyof typeof Exams;
}

export { };