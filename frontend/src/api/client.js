import axios from 'axios';

// By default FastAPI runs on 8000 locally
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  createSession: async (userId, candidateName, resumeFile = null) => {
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("candidate_name", candidateName);
    if (resumeFile) {
        formData.append("file", resumeFile);
    }
    const res = await client.post('/session', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return res.data;
  },
  
  respond: async (sessionId, message) => {
    const res = await client.post('/respond', { session_id: sessionId, message });
    return res.data; // { message: string, status: string }
  },
  
  getReport: async (sessionId) => {
    const res = await client.get(`/report/${sessionId}`);
    return res.data;
  },
  
  getSession: async (sessionId) => {
      const res = await client.get(`/session/${sessionId}`);
      return res.data;
  },
  
  discontinueSession: async (sessionId) => {
      const res = await client.post(`/session/${sessionId}/discontinue`);
      return res.data;
  },
  
  generateTTS: async (text) => {
      const res = await client.post('/tts', { text }, { responseType: 'blob' });
      return res.data;
  },
  
  generatePrepQuestions: async (resumeFile) => {
      const formData = new FormData();
      formData.append("file", resumeFile);
      const res = await client.post('/prep/generate', formData, {
          headers: {
              'Content-Type': 'multipart/form-data',
          }
      });
      return res.data;
  }
};
