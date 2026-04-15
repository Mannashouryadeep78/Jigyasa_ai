# Jigyasa.ai — AI Tutor Screener

> An end-to-end AI-powered interview platform built specifically to screen candidates for tutoring and teaching positions — with voice, scoring, and analytics, entirely on free-tier infrastructure.

---

## What I Built & The Problem I Picked

The hiring process for tutors and educators is broken. Schools and edtech companies spend hours scheduling, conducting, and evaluating interviews — only to find that a candidate who looked great on paper struggles to explain a concept to a child or handle a frustrated student. There is no scalable, intelligent way to pre-screen teaching candidates for the qualities that actually matter: pedagogical empathy, communication clarity, subject depth, and adaptability.

**Jigyasa.ai** is a full-stack AI interview platform that conducts four distinct screening rounds autonomously:

| Round | Interviewer | Focus |
|---|---|---|
| **HR Round** | Alex | Career journey, values, work style, conflict resolution |
| **Technical Round** | Jordan | Deep resume-specific domain knowledge — not generic DSA |
| **Group Discussion** | Morgan | Education policy debate tailored to the candidate's domain |
| **Tutor Round** | Professor Maria | Pedagogical soft skills — how they teach, not what they know |

Each round is driven by a different LLM persona with a purpose-built system prompt. The platform conducts the interview via **real-time voice** (browser Speech Recognition + Whisper), scores every answer against a calibrated rubric, generates a detailed assessment report, and surfaces performance analytics across all sessions.

Additional tools on the platform:
- **Interview Prep Tool** — uploads a resume and generates 20 targeted practice Q&As
- **ATS Resume Checker** — scores a resume against real ATS system criteria (Workday, Greenhouse, Lever, iCIMS)

**Problem statement chosen:** Automated AI Tutor Screener for evaluating teaching candidates across multiple dimensions before a human ever gets involved.

---

## Tech Stack

**Frontend:** React 19 + Vite + Tailwind CSS v4 + Framer Motion + Recharts  
**Backend:** FastAPI + LangGraph + LangChain  
**LLM:** Groq (`llama-3.3-70b-versatile` for interview + scoring, `whisper-large-v3` for transcription)  
**Database:** Supabase (PostgreSQL — sessions, assessments, auth)  
**Auth:** Supabase Auth (JWT)  
**Deployment:** Vercel (frontend) + Render (backend)

---

## Key Decisions & Tradeoffs

### 1. LangGraph for Conversation State Instead of a Simple Loop
I chose LangGraph to manage interview state as a graph with explicit nodes (`question_selector`, `evaluator`, `followup_decider`, `report_generator`) and typed edges. The tradeoff is added complexity over a plain loop, but the payoff is clean phase transitions — the graph knows when to probe deeper, when to move on, and when to wrap up — and the state is serializable for crash recovery.

### 2. Dual-Track Transcription (Browser Speech API + Whisper)
The browser's `SpeechRecognition` API gives instant visual feedback (you see your words appear as you speak), but its accuracy is mediocre. Simultaneously, a `MediaRecorder` captures raw audio. When the user stops speaking, the audio blob is sent to Groq's `whisper-large-v3` for a high-accuracy transcript, which replaces the browser text before it reaches the LLM. If Whisper fails, the browser text is used as a silent fallback. The tradeoff is one extra API call per turn, but the improvement in transcript quality — especially for non-native speakers — is significant.

### 3. Free-Tier Everything (Intentional Constraint)
The entire system runs on Groq's free tier, Supabase's free tier, and Vercel/Render free plans. This forced real engineering decisions: aggressive prompt brevity (1–3 sentence responses), token budget awareness in scoring prompts, and graceful degradation when rate limits are hit. The tradeoff is occasional 429 errors under load, which are surfaced to the user with a clear message.

### 4. Resume-Grounded Technical & GD Rounds
Jordan (Technical) and Morgan (GD) both receive the full resume text in their system prompt. Jordan is instructed to ask only about tools, projects, and technologies the candidate themselves listed — never generic LeetCode questions unless competitive programming appears on the resume. Morgan identifies the candidate's domain from the resume and selects a domain-specific education policy debate topic. The tradeoff is slightly longer system prompts, but the interview quality improvement is dramatic — every session feels genuinely personalised.

### 5. Session Persistence via Supabase `state_json`
LangGraph's `MemorySaver` is in-memory — a server restart wipes all sessions. To allow candidates to continue an interrupted interview, I serialise the full LangGraph state (messages, phase, metadata) to a `state_json JSONB` column in Supabase after every turn. On reconnect, `interview_graph.update_state()` reconstructs the checkpoint. The tradeoff is a small latency cost per turn for the persistence write, which is acceptable.

### 6. Calibrated Scoring Rubrics
Early versions of the scorer (using `llama-3.1-8b-instant`) produced inflated or erratic scores — everyone got 3.5/5 for everything. I upgraded the scoring model to `llama-3.3-70b-versatile` and rewrote all four rubrics with explicit anchor descriptions for every point value (1 = no evidence, 2 = weak, 3 = acceptable, 4 = good, 5 = standout with concrete evidence). This produced far more differentiated and useful assessments.

---

## Interesting Challenges & How I Solved Them

### Mobile White Screen on Interview Start
After wiring up the auto-scroll feature for the chat, the interview room was throwing a blank white screen on mobile. The root cause was subtle: a `useEffect` dependency array referenced `isListening` and `transcript` — variables that come from `useSpeechRecognition()` — but the `useEffect` call was placed *before* that hook in the component body. JavaScript's temporal dead zone made those `const` variables inaccessible when React evaluated the dependency array, crashing the component silently. Fix: moved the `useEffect` to after the hook declaration.

### PDF Export Showing Only 3 Questions (1 Page)
The Interview Prep PDF was cutting off after one page. The culprit was `overflow: hidden` and `height: 100dvh` on the root dashboard container — CSS that is correct for the screen UI but clips print output to exactly one screen height. The fix was a targeted `@media print` rule that sets `html, body, #root { height: auto !important; overflow: visible !important }` and applies `overflow: visible !important` universally, letting the browser paginate the full document.

### Answer Text Invisible in Printed PDF
After fixing the page count, answer text was still invisible in the PDF — white text on white paper. The issue: Tailwind utility classes like `text-white/70` produce `rgba(255,255,255,0.7)`, which is completely invisible on paper. A CSS attribute selector `[class*="text-white"] { color: #1a1a1a !important }` in `@media print` caught every Tailwind white variant in a single rule.

### Mic Flashing 3–4 Times on Mobile
On mobile Chrome, `SpeechRecognition` with `continuous: false` fires `onend` every few seconds, causing the hook to spin up a new recognition instance each time. Each new `.start()` call triggers the browser's native microphone indicator to flash. Setting `recognition.continuous = true` on mobile devices eliminates the restart cycle — the silence detection timer handles submission instead, and the mic indicator stays steady.

### GD Round Always Picking the Same Topic
The Group Discussion prompt had a static, generic topic bank and — critically — was not injecting `{resume_text}` into the prompt at all, so Morgan had no idea who she was talking to. The fix was a complete rewrite: the prompt now injects the full resume, defines seven domain-specific topic banks (Mathematics, STEM, English, History, Early Childhood, Special Education, General), and instructs Morgan to read the resume, identify the domain, and pick the most relevant topic. Every session now produces a genuinely domain-matched debate.

### Recharts Rendering at -1 × -1 on First Mount
Recharts' `ResponsiveContainer` measures its parent via `ResizeObserver` synchronously on mount. Inside an animating `motion.div`, the layout hasn't settled yet, so it reads the container as `-1 × -1` and throws a console warning. The fix: replaced `ResponsiveContainer` with a `useLayoutEffect` + `ResizeObserver` that watches the parent `div` directly, and passes explicit `width` and `height` pixel values to `BarChart` only after the container has measured a non-zero size.

---

## What I Would Improve With More Time

### i. Breathtaking UI Redesign
The current UI is clean and functional but built under time pressure. With more time I would completely redesign the interface — cinematic hero animations, a proper onboarding flow with micro-interactions, a polished mobile-first interview room with a real-time voice waveform that responds to both the interviewer and candidate, and a dashboard that feels like a premium SaaS product rather than a demo.

### ii. Multi-Language Support
The platform currently works only in English. I would add language selection at session creation — the system prompts, TTS voice, and STT language code would all switch together. Groq's Whisper supports 57 languages out of the box, so transcription is largely solved; the main work is translating/localising the persona prompts and UI copy.

### iii. Admin Panel & Interview Link Distribution
A full admin dashboard where an organisation can: configure which interview rounds to run, customise the question banks and rubrics for their specific role, bulk-invite candidates by email (generating unique one-time session links), review completed reports, export results to CSV, and manage user seats. This would make Jigyasa.ai a deployable B2B product — not just a demo — and let companies send screening links the same way they send take-home assessments.

### iv. Upgraded Model Tier & Longer Interviews
The entire platform runs on Groq's free tier, which caps tokens per minute and forces very short responses (1–3 sentences per turn, ~6–8 questions per round). With a paid Groq or OpenAI tier I would: remove the brevity constraints, allow 12–15 questions per round, enable genuine multi-turn follow-up chains, use a larger context window to hold the full conversation without truncation, and switch to a higher-quality TTS voice (ElevenLabs or OpenAI TTS) for a more natural interviewer persona.

---

## Running Locally

### Prerequisites
- Node.js 18+, Python 3.11+
- Groq API key, Supabase project URL + anon key

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
# Create .env with GROQ_API_KEY, SUPABASE_URL, SUPABASE_KEY, SUPABASE_JWT_SECRET
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
# Create .env with VITE_API_URL=http://localhost:8000 and VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
npm run dev
```

### Supabase Migration (required for session persistence)
```sql
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS state_json JSONB DEFAULT NULL;
```

---

## Project Structure

```
AiTutorScreener/
├── backend/
│   ├── main.py                  # FastAPI routes
│   ├── graph/
│   │   ├── interview_graph.py   # LangGraph graph definition
│   │   ├── nodes.py             # question_selector, evaluator, report_generator
│   │   ├── state.py             # InterviewState TypedDict
│   │   └── edges.py             # Routing logic between nodes
│   ├── prompts/
│   │   ├── system.py            # HR, Technical, GD, Tutor persona prompts
│   │   └── rubric.py            # Calibrated scoring rubrics (1–5 anchors)
│   └── services/
│       ├── groq_client.py       # LLM + Whisper client
│       └── supabase_client.py   # DB helpers (sessions, assessments, state)
└── frontend/
    └── src/
        ├── components/
        │   ├── LandingPage.jsx
        │   ├── InterviewRoom.jsx    # Live voice interview UI
        │   ├── AssessmentReport.jsx
        │   ├── AnalyticsView.jsx
        │   ├── InterviewPrepTool.jsx
        │   └── ATSChecker.jsx
        ├── hooks/
        │   ├── useSpeechRecognition.js  # Browser STT + MediaRecorder
        │   └── useTTS.js               # Web Speech API TTS
        └── api/
            └── client.js              # Axios API wrapper
```

---

*Built by Mannashouryadeep78 — powered by Groq, LangGraph, Supabase, and a lot of free-tier creativity.*
