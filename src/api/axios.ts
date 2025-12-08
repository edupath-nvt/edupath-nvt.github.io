
import type { TargetData } from 'src/pages/target/utils/get-score';

import rootAxios from 'axios';

import { db } from 'src/database/dexie';
import { Exams, Subjects } from 'src/mock/default-data';



const axios = rootAxios.create({
  baseURL: `${import.meta.env.VITE_SERVER_URL}`,
  timeout: 10000,
});

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
})

const API = {
  getToken: (u: Omit<User, 'id'>) => axios.post('/get-token', u).then((res) => {
    localStorage.setItem('id_target', res.data.id_target);
    return res.data.access_token as string;
  }),
  getList: () => axios.get('/target').then((res) => res.data as TargetDatabase[]),
  asyncTarget: (target: TargetDatabase) => axios.post(`/target`, target).then((res) => res.data.id as number),
  getTarget: (id: number) => axios.get(`/target/${id}`).then((res) => res.data as TargetDatabase),
  chat: async (target: TargetData, onMessage: (msg: string) => void) => {
    const scores = await db.scores.toCollection().filter(x => x.subject === target.subject).toArray()
    const avg = [
      target.scores[0][1] > 0 ? target.scores[0][0] / target.scores[0][1] : null,
      target.scores[1][1] > 0 ? target.scores[1][0] / target.scores[1][1] : null
    ]
    const objectPromt = {
      nameSubject: Subjects[target.subject].name,
      nameShort: target.subject,
      examsWeight: Object.entries(Exams).reduce((r, c) => {
        r[c[0] as Exams] = c[1].weight
        return r;
      }, {} as Record<Exams, number>),
      target: target.target,
      semester: [{
        isInputed: target.scores[0][1] > 0,
        currentScore: avg[0],
        scoresList: scores.filter(x => x.semester === 0),
        isFishnied: scores.filter(x => x.semester === 0).length === (Object.values(target.exams[0])).reduce((r, c) => r + c, 0),
      }, {
        isInputed: target.scores[1][1] > 0,
        currentScore: avg[1],
        scoresList: scores.filter(x => x.semester === 1),
        isFishnied: scores.filter(x => x.semester === 0).length === (Object.values(target.exams[1])).reduce((r, c) => r + c, 0),
      }],
      score: avg[0] && avg[1] ? (avg[0] + avg[1] * 2) / 3 : null,
      canAchieveTarget: !(target.requiredSemester[0] > 10 || target.requiredSemester[1] > 10)
    }

    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/ai-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ message: `Dựa trên Object ${JSON.stringify(objectPromt)} hãy đánh giá môn học, tôi có thể đạt được mục tiêu không? - làm sao để đạt được mục tiêu, cho tôi lời khuyên. trả lời tự nhiên không nhắc đến object trong câu trả lời. 
       - nếu canAchieveTarget là false tức là không thể đạt được mục tiêu, yêu cầu thay đổi mục tiêu.
      ` }),
    });
    let msg = "";
    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    onMessage("Loading...")
    if (!reader) return;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const msgData = decoder.decode(value);
      msg += msgData;
      onMessage(msg);
    }
  }
}



export { API, axios };
