import os
import httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

def get_supabase_client():
    # Returns config dict used to build request headers
    return {"url": SUPABASE_URL, "key": SUPABASE_KEY}

def _get_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

def log_session(session_id: str, candidate_name: str, user_id: str):
    try:
        url = f"{SUPABASE_URL}/rest/v1/sessions"
        data = {"id": session_id, "name": candidate_name, "user_id": user_id}
        response = httpx.post(url, headers=_get_headers(), json=data)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Failed to log session: {e}")

def get_session(session_id: str):
    try:
        url = f"{SUPABASE_URL}/rest/v1/sessions?id=eq.{session_id}"
        response = httpx.get(url, headers=_get_headers())
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Failed to get session: {e}")

def update_session_status(session_id: str, status: str):
    try:
        url = f"{SUPABASE_URL}/rest/v1/sessions?id=eq.{session_id}"
        data = {"status": status}
        response = httpx.patch(url, headers=_get_headers(), json=data)
        response.raise_for_status()
    except Exception as e:
        print(f"Failed to update session status: {e}")

def save_assessment(session_id: str, scores: dict, quotes: dict):
    try:
        url = f"{SUPABASE_URL}/rest/v1/assessments"
        data = {
            "session_id": session_id,
            "scores_json": scores,
            "quotes_json": quotes
        }
        response = httpx.post(url, headers=_get_headers(), json=data)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Failed to save assessment: {e}")
