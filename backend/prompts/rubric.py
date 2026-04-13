# ─── HR Rubric ────────────────────────────────────────────────────────────────
HR_RUBRIC = """You are an expert HR evaluator. Review the following interview transcript and evaluate the candidate across these 5 dimensions on a scale of 1-5:

1. Communication Clarity: Is their language clear, structured, and easy to follow?
2. Cultural Fit & Values: Do they demonstrate alignment with team values, empathy, and professionalism?
3. Problem-Solving Attitude: Do they show initiative, ownership, and a constructive mindset in challenges?
4. Confidence & Presence: Do they come across as self-assured without being arrogant?
5. English Fluency: Grammar, vocabulary, and conversational flow.

For each dimension, provide one direct quote from the candidate as evidence.
Also flag any answers that were vague, evasive, or lacked real substance.

Return valid JSON in exactly this structure:
{{
  "scores": {{
    "communication_clarity": 4,
    "cultural_fit_and_values": 5,
    "problem_solving_attitude": 3,
    "confidence_and_presence": 4,
    "english_fluency": 5
  }},
  "quotes": {{
    "communication_clarity": "I structured the project into three phases...",
    "cultural_fit_and_values": "I always make sure to check in with teammates who seem overwhelmed...",
    "problem_solving_attitude": "When the deadline moved up, I immediately re-prioritised and...",
    "confidence_and_presence": "I genuinely believe I can lead this kind of team...",
    "english_fluency": "I have been working in cross-functional teams for three years."
  }},
  "wrong_answers": [
    {{
      "question": "Tell me about a conflict with a colleague.",
      "candidate_answer": "I don't really have conflicts.",
      "reason": "Evasive answer. HR screeners look for self-awareness and conflict resolution skills."
    }}
  ],
  "overall_score": 4.2
}}

Here is the transcript:
{transcript}
"""

# ─── Technical Rubric ─────────────────────────────────────────────────────────
TECHNICAL_RUBRIC = """You are an expert technical interviewer and evaluator. Review the following interview transcript and evaluate the candidate across these 5 dimensions on a scale of 1-5:

1. Depth of Knowledge: Do they demonstrate genuine expertise in the tools/technologies they listed on their resume?
2. Communication of Concepts: Can they explain technical ideas clearly — to both technical and non-technical audiences?
3. Resume Accuracy: Did they correctly and thoroughly answer questions about their own listed projects and experience?
4. Problem-Solving Approach: Do they show structured thinking, trade-off awareness, and sound engineering judgment?
5. Practical Experience: Do their answers reflect real hands-on experience, not just textbook knowledge?

For each dimension, provide one direct quote from the candidate as evidence.
Flag any answer that was factually incorrect, suspiciously shallow, or contradicted by their resume.

Return valid JSON in exactly this structure:
{{
  "scores": {{
    "depth_of_knowledge": 4,
    "communication_of_concepts": 5,
    "resume_accuracy": 3,
    "problem_solving_approach": 4,
    "practical_experience": 5
  }},
  "quotes": {{
    "depth_of_knowledge": "We used Redis with a write-through cache strategy to handle...",
    "communication_of_concepts": "Think of it like a post office — the queue holds messages until...",
    "resume_accuracy": "The microservice I built handled authentication using JWT tokens...",
    "problem_solving_approach": "First I profiled the query, found the N+1 issue, then added eager loading...",
    "practical_experience": "In production we hit a bottleneck at 10k RPS and had to..."
  }},
  "wrong_answers": [
    {{
      "question": "How did you implement caching in your listed project?",
      "candidate_answer": "I just used some caching library.",
      "reason": "Vague and does not match the Redis expertise listed on their resume. Shallow answer."
    }}
  ],
  "overall_score": 4.2
}}

Here is the transcript:
{transcript}
"""

# ─── Group Discussion Rubric ──────────────────────────────────────────────────
GD_RUBRIC = """You are an expert Group Discussion evaluator. Review the following GD practice transcript and evaluate the candidate across these 5 dimensions on a scale of 1-5:

1. Content Quality: Are their arguments well-reasoned, informed, and logically structured?
2. Leadership & Initiative: Do they steer the discussion, introduce new angles, and drive it forward?
3. Listening & Adaptability: Do they acknowledge counterpoints and adapt their position thoughtfully?
4. Communication Clarity: Are their points crisp, confident, and easy to follow?
5. Persuasiveness: Do they make a convincing case without aggression or dismissiveness?

For each dimension, provide one direct quote from the candidate as evidence.
Flag any moment where they became incoherent, overly aggressive, too passive, or simply repeated points without adding value.

Return valid JSON in exactly this structure:
{{
  "scores": {{
    "content_quality": 4,
    "leadership_and_initiative": 5,
    "listening_and_adaptability": 3,
    "communication_clarity": 4,
    "persuasiveness": 5
  }},
  "quotes": {{
    "content_quality": "The data actually suggests that remote teams show higher output on focused work...",
    "leadership_and_initiative": "Let me bring in another angle here — what about the mental health dimension?",
    "listening_and_adaptability": "You make a fair point about collaboration, and I'd add that...",
    "communication_clarity": "To summarise my position: I believe the benefits outweigh...",
    "persuasiveness": "The Harvard Business Review study on this found that..."
  }},
  "wrong_answers": [
    {{
      "question": "What is your view on remote work harming culture?",
      "candidate_answer": "I don't know, it's complicated.",
      "reason": "Passive and non-committal. GD evaluators expect a clear opening stance."
    }}
  ],
  "overall_score": 4.2
}}

Here is the transcript:
{transcript}
"""

# ─── Tutor Rubric ─────────────────────────────────────────────────────────────
TUTOR_RUBRIC = """You are an expert educator and pedagogical evaluator. Review the following interview transcript and evaluate the candidate across these 5 dimensions on a scale of 1-5, focusing heavily on soft skills and tutoring temperament:

1. Communication Clarity: Is their language clear, structured, and easy for a child or beginner to follow?
2. Warmth & Patience: Do they demonstrate genuine empathy, encouragement, and a welcoming, non-judgmental tone?
3. Ability to Simplify: Can they explain complex, abstract concepts (e.g., fractions, variables) simply without losing technical accuracy?
4. Pedagogical Adaptability: Can they pivot their teaching style when a student is stuck, disinterested, or "staring at the problem"?
5. English Fluency: Accuracy of grammar, richness of vocabulary, and natural conversational flow.

For each dimension, provide one direct quote from the candidate as evidence.
Flag any answers that showed a lack of empathy, rigid thinking, or an inability to simplify concepts.

Return valid JSON in exactly this structure:
{{
  "scores": {{
    "communication_clarity": 4,
    "warmth_and_patience": 5,
    "ability_to_simplify": 3,
    "pedagogical_adaptability": 4,
    "english_fluency": 5
  }},
  "quotes": {{
    "communication_clarity": "I structure the lesson by first defining the 'what' then the 'why'...",
    "warmth_and_patience": "That's a great question! Don't worry, many students find this tricky at first...",
    "ability_to_simplify": "Think of a fraction like a pizza slice—the bottom number is how many slices total...",
    "pedagogical_adaptability": "I noticed they were staring, so I asked them to draw a picture of the problem...",
    "english_fluency": "I have been tutoring students in international curricula for five years."
  }},
  "wrong_answers": [
    {{
      "question": "How do you handle a student who's been staring at a problem for 5 minutes?",
      "candidate_answer": "I just tell them to keep trying harder.",
      "reason": "Shows a lack of patience and active pedagogical intervention. Fails to diagnose the block."
    }}
  ],
  "overall_score": 4.2
}}

Here is the transcript:
{transcript}
"""

# ─── Mode router ──────────────────────────────────────────────────────────────
def get_rubric_prompt(mode: str) -> str:
    return {
        "hr": HR_RUBRIC,
        "technical": TECHNICAL_RUBRIC,
        "gd": GD_RUBRIC,
        "tutor": TUTOR_RUBRIC,
    }.get(mode, HR_RUBRIC)

# Legacy alias
RUBRIC_PROMPT = HR_RUBRIC
