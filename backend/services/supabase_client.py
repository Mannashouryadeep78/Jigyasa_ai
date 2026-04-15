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
        url = f"{SUPABASE_URL}/rest/v1/sessions?id=eq.{session_id}&select=id,name,user_id,status"
        response = httpx.get(url, headers=_get_headers())
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Failed to get session: {e}")
        return []

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

def save_session_state(session_id: str, state_data: dict):
    """
    Persist serialized session messages + metadata to Supabase for crash-recovery.
    Requires a `state_json JSONB` column on the sessions table:
        ALTER TABLE sessions ADD COLUMN IF NOT EXISTS state_json JSONB DEFAULT NULL;
    """
    try:
        url = f"{SUPABASE_URL}/rest/v1/sessions?id=eq.{session_id}"
        response = httpx.patch(url, headers=_get_headers(), json={"state_json": state_data})
        response.raise_for_status()
    except Exception as e:
        print(f"[WARN] save_session_state failed (is state_json column added to sessions table?): {e}")

def get_global_benchmark() -> dict:
    """
    Returns the highest score ever achieved per metric across ALL assessments.
    Used to power the 'Best in Class' benchmark bar in Analytics.
    """
    try:
        url = f"{SUPABASE_URL}/rest/v1/assessments?select=scores_json"
        response = httpx.get(url, headers=_get_headers())
        response.raise_for_status()
        rows = response.json()
        maxes: dict[str, float] = {}
        for row in rows:
            scores = row.get("scores_json", {})
            if not isinstance(scores, dict):
                continue
            for key, val in scores.items():
                try:
                    num = float(val)
                    if key not in maxes or num > maxes[key]:
                        maxes[key] = num
                except (ValueError, TypeError):
                    pass
        return maxes
    except Exception as e:
        print(f"[WARN] get_global_benchmark failed: {e}")
        return {}

def load_session_state(session_id: str) -> dict:
    """Load persisted session state for crash-recovery."""
    try:
        url = f"{SUPABASE_URL}/rest/v1/sessions?id=eq.{session_id}&select=state_json,name,status"
        response = httpx.get(url, headers=_get_headers())
        response.raise_for_status()
        rows = response.json()
        if rows and rows[0].get("state_json"):
            return rows[0]["state_json"]
        return {}
    except Exception as e:
        print(f"[WARN] load_session_state failed: {e}")
        return {}
