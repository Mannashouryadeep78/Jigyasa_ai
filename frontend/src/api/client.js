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

// ─── 401 Response Interceptor ───────────────────────────────────────────────
// If a request gets a 401 (token expired), refresh the Supabase session and retry once.
let isRefreshing = false;
let refreshQueue = [];

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          // Dynamically import supabase to avoid circular deps
          const { supabase } = await import('../lib/supabase');
          const { data, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError || !data?.session) {
            // Refresh failed — force sign out and clear local state
            console.warn('Session refresh failed:', refreshError?.message);
            await supabase.auth.signOut();
            window.location.href = '/'; // Simple hard redirect to clear state
            
            refreshQueue.forEach(cb => cb(null));
            refreshQueue = [];
            isRefreshing = false;
            return Promise.reject(error);
          }
          const newToken = data.session.access_token;
          refreshQueue.forEach(cb => cb(newToken));
          refreshQueue = [];
          isRefreshing = false;

          // Retry the original request with the new token
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return client(originalRequest);
        } catch (e) {
          refreshQueue.forEach(cb => cb(null));
          refreshQueue = [];
          isRefreshing = false;
          return Promise.reject(error);
        }
      } else {
        // Another refresh is in progress — queue this request
        return new Promise((resolve, reject) => {
          refreshQueue.push((token) => {
            if (token) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              resolve(client(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }
    }
    return Promise.reject(error);
  }
);

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
  
  // Public endpoint — no auth token needed
  generatePrepQuestions: async (resumeFile) => {
      const formData = new FormData();
      formData.append("file", resumeFile);
      const res = await axios.post(`${baseURL}/prep/generate`, formData, {
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
