from typing import List, Optional
from django.conf import settings

# If you already have imports for your LLM/provider, keep them.

def generate_questions_from_cv(cv_text: str, requested_count: Optional[int] = None) -> List[dict]:
    """
    Generate quiz questions from a CV text. Enforces a server-side cap and
    scales count based on requested_count (clamped to [1, QUIZ_MAX_QUESTIONS]).
    Returns a list of question dicts in your existing format.
    """

    # --- your existing LLM/prompt logic to produce raw_questions (list[dict]) ---
    # Example shape (keep your format):
    # raw_questions = [
    #   {"id": "...", "question": "...", "choices": ["A","B","C","D"], "answer": 1},
    #   ...
    # ]
    raw_questions = _generate_raw_questions(cv_text)  # <- replace with your actual code

    max_q = getattr(settings, "QUIZ_MAX_QUESTIONS", 20)
    default_q = getattr(settings, "QUIZ_DEFAULT_QUESTIONS", 10)

    try:
        target = int(requested_count) if requested_count is not None else default_q
    except (TypeError, ValueError):
        target = default_q

    # clamp to [1, max_q]
    target = max(1, min(target, max_q))

    # keep order; slice down to target size
    return raw_questions[:target]


# ---- helper (placeholder) ----
def _generate_raw_questions(cv_text: str) -> List[dict]:
    """
    Placeholder; use your actual generation pipeline.
    """
    # This should be replaced by your existing logic that talks to the model,
    # parses the response, and returns a list of question dicts.
    return []
