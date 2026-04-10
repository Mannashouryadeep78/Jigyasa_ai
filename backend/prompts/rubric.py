RUBRIC_PROMPT = """You are an expert evaluator of teaching candidates.
Review the following transcript of an interview between a Candidate and the Screener.

Please evaluate the candidate across these 5 dimensions on a scale of 1-5:

1. Communication clarity: Is their language precise, well-structured, jargon-free?
2. Warmth & patience: Do they show empathy? Would a child feel safe?
3. Ability to simplify: Can they explain complex ideas accessibly?
4. Technical/Resume Accuracy: Did they correctly answer the specific technical or experiential questions based on their resume?
5. English fluency: Grammar, vocabulary, flow.

For each dimension, you MUST provide exactly one direct quote from the candidate as evidence.

Additionally, you must pinpoint any specific answers that were factually incorrect, deeply flawed, or lacked required depth in the context of their resume.

You must return valid JSON in exactly this structure:
{{
  "scores": {{
    "communication_clarity": 4,
    "warmth_and_patience": 5,
    "ability_to_simplify": 3,
    "technical_accuracy": 4,
    "english_fluency": 5
  }},
  "quotes": {{
    "communication_clarity": "I would break the fraction down into slices of pizza...",
    "warmth_and_patience": "Take your time... it's okay to feel stuck.",
    "ability_to_simplify": "The numerator is the top number, like...",
    "technical_accuracy": "I implemented AWS lambda leveraging SQS...",
    "english_fluency": "I have been tutoring for five years."
  }},
  "wrong_answers": [
    {{
      "question": "How did you implement the XYZ feature?",
      "candidate_answer": "I used a standard database query.",
      "reason": "This answer lacks depth and does not explain their listed skills in Redis caching."
    }}
  ],
  "overall_score": 4.2
}}

Here is the transcript:
{transcript}
"""
