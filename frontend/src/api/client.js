import axios from 'axios';

// By default FastAPI runs on 8000 locally
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Auth Interceptor (Fix #2) ─────────────────────────────────────────────
// Reads the Supabase session token from localStorage and injects it into every request.
// Supabase stores it under the key: sb-<project-ref>-auth-token
client.interceptors.request.use((config) => {
  try {
    // Find the Supabase session key dynamically (works regardless of project ref)
    const supabaseKey = Object.keys(localStorage).find(
      (k) => k.startsWith('sb-') && k.endsWith('-auth-token')
    );
    if (supabaseKey) {
      const session = JSON.parse(localStorage.getItem(supabaseKey) || '{}');
      const token = session?.access_token;
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
  } catch (e) {
    // Silent fail — auth will be rejected at the server level if missing
    console.warn('Could not read auth token from localStorage', e);
  }
  return config;
});

export const api = {
  createSession: async (userId, candidateName, resumeFile = null, interviewMode = 'hr') => {
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("candidate_name", candidateName);
    formData.append("interview_mode", interviewMode);
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
    return res.data;
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
  },
  
  generateAnalyticsGuidance: async (history) => {
      const res = await client.post('/analytics/guidance', { history });
      return res.data;
  },

  // Public endpoint — no auth token needed
  checkATS: async (resumeFile) => {
      const formData = new FormData();
      formData.append("file", resumeFile);
      const res = await axios.post(`${baseURL}/ats/check`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
  },
};
