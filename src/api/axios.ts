import type { Message } from 'src/pages/ai-analysis/page';

import rootAxios from 'axios';

import { db } from 'src/database/dexie';
import { getScore } from 'src/pages/target/utils/get-score';


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
  chat: async (msg: Message, onMessage: React.Dispatch<React.SetStateAction<Message>>, isCallFn?: boolean) => {
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/ai-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ messages: msg.filter(x => !x.noServer).slice(-10) }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) return;
    const messageResponse: Message[number] = { role: 'assistant', content: '' };
    if (!isCallFn) {
      onMessage([...msg, messageResponse]);
    } else {
      onMessage((pre) => [...pre, messageResponse]);
    }

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const msgData = decoder.decode(value);
      messageResponse.content += msgData;
      onMessage((pre) => [...pre])
    }

    if (messageResponse.content.startsWith("[") && messageResponse.content.endsWith("]")) {

      const functionData = JSON.parse(messageResponse.content)
      if (functionData[0] === 'evaluate_target') {
        onMessage((pre) => pre.slice(0, -1));
        await API.chat([{ role: 'user', content: `[nofunction] Tôi có dữ liệu này ${JSON.stringify(await getScore())}, chỉ dựa vào dữ liệu này hãy đáng giá mục tiêu các môn học giúp tôi, môn nào chưa nhập điểm thì không đánh giá là chưa đạt, hãy giúp tôi đưa ra lời khuyên để đạt được mục tiêu các môn học.` }], onMessage, true);
      }
      if (functionData[0] === 'add_score') {
        try {
          const now = new Date();
          await db.scores.add({
            subject: functionData[1]['subject'] as Subjects,
            exams: functionData[1]['exams'] as Exams,
            score: functionData[1]['score'] as number,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
          });
          messageResponse.content = `Đã ghi nhận bạn được ${functionData[1]['score']} điểm (Môn ${functionData[1]['subject']}, ${functionData[1]['exams']})`;
          messageResponse.noServer = true;
          onMessage((pre) => [...pre])
        } catch {
          messageResponse.content = `Đã xảy ra lỗi khi gọi hàm...`;
          messageResponse.noServer = true;
          onMessage((pre) => [...pre])
        }
      }
    }

  }
}



export { API, axios };
