import os
from groq import Groq
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# For pure Groq tasks, like Whisper, if needed
_groq_client = Groq(api_key=GROQ_API_KEY)

def get_llm():
    """
    Returns a configured ChatGroq instance for use with LangChain/LangGraph.
    Defaulting to llama-3.3-70b-versatile for high quality and speed.
    """
    return ChatGroq(
        temperature=0.7,
        model_name="llama-3.3-70b-versatile",  # Upgraded for interview quality
        groq_api_key=GROQ_API_KEY,
        request_timeout=25
    )

def get_json_llm():
    """
    Returns a ChatGroq instance optimized for structured JSON output (e.g., Assessment, ATS, Prep).
    Uses the 70B model for accurate scoring and analysis.
    """
    return ChatGroq(
        temperature=0.1,
        model_name="llama-3.3-70b-versatile",
        groq_api_key=GROQ_API_KEY,
        request_timeout=40,
        model_kwargs={"response_format": {"type": "json_object"}}
    )

def transcribe_audio(file_path: str):
    """
    Transcribes audio using Groq's Whisper model.
    """
    with open(file_path, "rb") as file:
        transcription = _groq_client.audio.transcriptions.create(
            file=(file_path, file.read()),
            model="whisper-large-v3",
            response_format="verbose_json",
        )
    return transcription.text
