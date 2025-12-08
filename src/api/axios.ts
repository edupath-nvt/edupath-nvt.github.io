
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
  // chat: async (msg: Message, onMessage: React.Dispatch<React.SetStateAction<Message>>, isCallFn?: boolean) => {
  //   const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/ai-chat`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${localStorage.getItem('access_token')}`
  //     },
  //     body: JSON.stringify({ messages: msg.filter(x => !x.noServer).slice(-10) }),
  //   });

  //   const reader = res.body?.getReader();
  //   const decoder = new TextDecoder();
  //   if (!reader) return;
  //   const messageResponse: Message[number] = { role: 'assistant', content: '' };
  //   if (!isCallFn) {
  //     onMessage([...msg, messageResponse]);
  //   } else {
  //     onMessage((pre) => [...pre, messageResponse]);
  //   }

  //   while (true) {
  //     const { value, done } = await reader.read();
  //     if (done) break;
  //     const msgData = decoder.decode(value);
  //     messageResponse.content += msgData;
  //     onMessage((pre) => [...pre])
  //   }

  //   if (messageResponse.content.startsWith("[") && messageResponse.content.endsWith("]")) {

  //     const functionData = JSON.parse(messageResponse.content)
  //     if (functionData[0] === 'evaluate_target') {
  //       onMessage((pre) => pre.slice(0, -1));
  //       await API.chat([{ role: 'user', content: `[nofunction] Tôi có dữ liệu này ${JSON.stringify(await getScore())}, chỉ dựa vào dữ liệu này hãy đáng giá mục tiêu các môn học giúp tôi, môn nào chưa nhập điểm thì không đánh giá là chưa đạt, hãy giúp tôi đưa ra lời khuyên để đạt được mục tiêu các môn học.` }], onMessage, true);
  //     }
  //     if (functionData[0] === 'add_score') {
  //       try {
  //         const now = new Date();
  //         const target = await db.targets.where('subject').equals(functionData[1]['subject']).first();
  //         if (target) {
  //           const score = await db.scores.where({ subject: functionData[1]['subject'] as Subjects, exams: functionData[1]['exams'] as Exams }).count();
  //           if (target.exams[functionData[1]['exams'] as Exams] >= score) {
  //             messageResponse.content = `Đã nhập đầy đủ điểm nên không thể thêm điểm nữa`
  //             messageResponse.noServer = true;
  //             onMessage((pre) => [...pre])
  //             return
  //           }
  //         } else {
  //           messageResponse.content = `Chưa đặt mục tiêu cho môn học ${functionData[1]['subject']} nên không thể thêm điểm`
  //           messageResponse.noServer = true;
  //           onMessage((pre) => [...pre])
  //           return
  //         }
  //         await db.scores.add({
  //           subject: functionData[1]['subject'] as Subjects,
  //           exams: functionData[1]['exams'] as Exams,
  //           score: functionData[1]['score'] as number,
  //           createdAt: now.toISOString(),
  //           updatedAt: now.toISOString(),
  //         });
  //         messageResponse.content = `Đã ghi nhận bạn được ${functionData[1]['score']} điểm (Môn ${functionData[1]['subject']}, ${functionData[1]['exams']})`;
  //         messageResponse.noServer = true;
  //         onMessage((pre) => [...pre])
  //       } catch {
  //         messageResponse.content = `Đã xảy ra lỗi khi gọi hàm...`;
  //         messageResponse.noServer = true;
  //         onMessage((pre) => [...pre])
  //       }
  //     }
  //   }

  // }
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
      body: JSON.stringify({ messages: `Dựa trên Object ${JSON.stringify(objectPromt)} hãy đánh giá môn học, tôi có thể đạt được mục tiêu không? - làm sao để đạt được mục tiêu, cho tôi lời khuyên` }),
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
