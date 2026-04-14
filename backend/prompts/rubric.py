# ─── HR Rubric ────────────────────────────────────────────────────────────────
HR_RUBRIC = """You are an expert HR evaluator. Review the following interview transcript and evaluate the candidate across these 5 dimensions on a scale of 1-5.

SCORING CALIBRATION (apply strictly):
- 1 = No evidence / completely failed this dimension (e.g., evasive, off-topic, or silent)
- 2 = Weak — minimal or vague response with little substance
- 3 = Acceptable — meets basic expectations but lacks specifics or depth
- 4 = Good — clear, specific answer with real examples; confident and structured
- 5 = Excellent — standout answer: concrete, memorable, shows genuine insight or self-awareness

Dimensions:
1. Communication Clarity: Is their language clear, structured, and easy to follow? (1=rambling/incoherent, 5=crisp, logical, well-structured)
2. Cultural Fit & Values: Do they demonstrate alignment with team values, empathy, and professionalism? (1=tone-deaf/unprofessional, 5=genuine warmth, clear values, empathetic)
3. Problem-Solving Attitude: Do they show initiative, ownership, and a constructive mindset in challenges? (1=victim mindset/no ownership, 5=proactive, specific STAR example, clear outcome)
4. Confidence & Presence: Do they come across as self-assured without being arrogant? (1=meek/over-apologetic or arrogant, 5=grounded, direct, assured)
5. English Fluency: Grammar, vocabulary, and conversational flow. (1=frequent errors that hinder understanding, 5=natural, articulate, rich vocabulary)

For each dimension, extract one direct verbatim quote from the candidate as evidence for your score.
Flag any answers that were vague, evasive, or lacked real substance.

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
TECHNICAL_RUBRIC = """You are an expert technical interviewer and evaluator. Review the following interview transcript and evaluate the candidate across these 5 dimensions on a scale of 1-5.

SCORING CALIBRATION (apply strictly):
- 1 = No evidence / complete failure — couldn't answer, gave wrong facts, or made things up
- 2 = Weak — surface-level answer, buzzwords only, no real understanding demonstrated
- 3 = Acceptable — basic understanding shown but lacks depth, specifics, or real-world context
- 4 = Good — solid explanation with specific details, mentions trade-offs or edge cases
- 5 = Excellent — expert-level: precise, shows deep hands-on experience, discusses real decisions made

Dimensions:
1. Depth of Knowledge: Do they demonstrate genuine expertise in the tools/technologies listed on their resume? (1=can't explain basics, 5=expert-level depth with implementation specifics)
2. Communication of Concepts: Can they explain technical ideas clearly? (1=jargon soup/incomprehensible, 5=clear analogy, layered explanation, adapts to audience)
3. Resume Accuracy: Did they correctly answer questions about their own listed projects and experience? (1=can't remember/contradicts resume, 5=crisp, detailed, consistent recall)
4. Problem-Solving Approach: Do they show structured thinking, trade-off awareness, and sound engineering judgment? (1=no structure/guesswork, 5=systematic breakdown, considers alternatives, mentions outcomes)
5. Practical Experience: Do their answers reflect real hands-on experience, not just textbook knowledge? (1=purely theoretical, 5=specific production scenarios, real bugs, real scale mentioned)

For each dimension, extract one direct verbatim quote from the candidate as evidence.
Flag any answer that was factually incorrect, suspiciously shallow, or contradicted their resume.

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
GD_RUBRIC = """You are an expert Group Discussion evaluator. Review the following GD practice transcript and evaluate the candidate across these 5 dimensions on a scale of 1-5.

SCORING CALIBRATION (apply strictly):
- 1 = Failed entirely — passive, incoherent, or disruptive
- 2 = Weak — contributed minimally, repeated others' points, no new value added
- 3 = Acceptable — made some valid points but lacked depth, originality, or leadership
- 4 = Good — clearly contributed, showed logic and awareness, moved discussion forward
- 5 = Excellent — standout contributor: introduced unique angles, backed claims with data/examples, commanded presence

Dimensions:
1. Content Quality: Are their arguments well-reasoned, informed, and logically structured? (1=baseless/incoherent, 5=data-backed, multi-angle, logically airtight)
2. Leadership & Initiative: Do they steer discussion, introduce new angles, drive it forward? (1=passive/follower, 5=sets agenda, synthesizes, pivots discussion productively)
3. Listening & Adaptability: Do they acknowledge counterpoints and adapt their position? (1=talks over others/ignores counterpoints, 5=genuinely engages, concedes fairly, builds on others)
4. Communication Clarity: Are their points crisp, confident, and easy to follow? (1=rambling/hard to follow, 5=clear, punchy, memorable)
5. Persuasiveness: Do they make a convincing case without aggression? (1=weak or aggressive, 5=compelling, evidence-based, calm but firm)

For each dimension, extract one direct verbatim quote from the candidate as evidence.
Flag any moment where they became incoherent, aggressive, overly passive, or added no new value.

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
TUTOR_RUBRIC = """You are an expert educator and pedagogical evaluator. Review the following interview transcript and evaluate the candidate across these 5 dimensions on a scale of 1-5, focusing heavily on soft skills and tutoring temperament.

SCORING CALIBRATION (apply strictly):
- 1 = Failed — showed opposite of the quality (e.g., impatient, condescending, rigid)
- 2 = Weak — minimal evidence of the quality; generic textbook response with no real application
- 3 = Acceptable — shows the quality but superficially; lacks a concrete child-focused example
- 4 = Good — clear evidence with a specific relatable strategy or example
- 5 = Excellent — standout: warm, specific, child-centric, shows genuine teaching instinct

Dimensions:
1. Communication Clarity: Is language clear, structured, and accessible for a child or beginner? (1=confusing/jargon-heavy, 5=crystal clear, naturally scaffolded)
2. Warmth & Patience: Do they show genuine empathy, encouragement, and non-judgmental tone? (1=cold/dismissive/impatient, 5=genuinely warm, normalizes struggle, builds confidence)
3. Ability to Simplify: Can they explain abstract concepts simply without losing accuracy? (1=over-complicated or dumbed down incorrectly, 5=brilliant analogy that clicks immediately)
4. Pedagogical Adaptability: Can they pivot when a student is stuck, bored, or lost? (1=rigid one-size-fits-all, 5=diagnoses the block, tries multiple angles, meets the student where they are)
5. English Fluency: Grammar, vocabulary, and natural conversational flow. (1=frequent errors that confuse, 5=articulate, rich vocabulary, effortlessly clear)

For each dimension, extract one direct verbatim quote from the candidate as evidence.
Flag any answers showing lack of empathy, rigid thinking, or inability to simplify.

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
