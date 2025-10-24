# import json
# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# from .ai_logic import extract_text_from_pdf, generate_questions_from_cv, generate_feedback_from_ai


# @csrf_exempt
# def generate_questions_view(request):
#     """API endpoint to upload CV and generate interview questions."""
#     if request.method == "POST" and request.FILES.get("cv"):
#         pdf_file = request.FILES["cv"]
#         cv_text = extract_text_from_pdf(pdf_file)
#         questions = generate_questions_from_cv(cv_text)
#         return JsonResponse({"questions": questions}, status=200)
#     return JsonResponse({"error": "Please upload a valid PDF file."}, status=400)


# @csrf_exempt
# def submit_answers_view(request):
#     """API endpoint to submit answers and get AI feedback."""
#     if request.method == "POST":
#         try:
#             data = json.loads(request.body)
#             answers = data.get("answers", [])
#             percent = data.get("percent", 0)

#             wrong_answers = [a for a in answers if a["chosen"] != a["correct"]]
#             feedback = generate_feedback_from_ai(wrong_answers, percent)

#             return JsonResponse({"score": percent, "feedback": feedback}, status=200)
#         except Exception as e:
#             return JsonResponse({"error": str(e)}, status=500)

#     return JsonResponse({"error": "Invalid request method."}, status=400)

# backend/ai/views.py
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.utils.datastructures import MultiValueDictKeyError
from django.core.files.uploadedfile import UploadedFile
from cv.models import CV  # adjust if your model name/app differs
from .ai_logic import extract_text_from_pdf, generate_questions_from_cv  # keep your existing functions
import json

@csrf_exempt
def generate_questions_view(request):
    """
    POST:
      JSON:  { "cv_id": <int> }               -> uses a server-stored CV file
      OR multipart/form-data with file under one of:
              'cv' | 'file' | 'pdf' | 'cv_file' | 'resume' | 'document'
    RESP: { "questions": [ {question, options?, answer?}, ... ] }
    """
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method."}, status=400)

    cv_file = None

    # Try JSON body with cv_id
    try:
        if request.content_type and "application/json" in request.content_type:
            body = request.body.decode("utf-8") or "{}"
            data = json.loads(body)
            cv_id = data.get("cv_id")
            if cv_id is not None:
                try:
                    obj = CV.objects.get(pk=cv_id)
                    cv_file = obj.file  # FileField
                except CV.DoesNotExist:
                    return JsonResponse({"error": "CV not found."}, status=404)
    except Exception:
        # Fall back to file upload
        pass

    # Try multipart with a file under common keys
    if cv_file is None:
        for key in ["cv", "file", "pdf", "cv_file", "resume", "document"]:
            if key in request.FILES:
                cv_file = request.FILES[key]
                break

        if not cv_file:
            return JsonResponse({"error": "Please upload a valid PDF file or provide cv_id."}, status=400)

    # Extract text & generate questions
    try:
        text = extract_text_from_pdf(cv_file)
        questions = generate_questions_from_cv(text)

        # Normalize to list[dict]
        questions = _normalize_questions(questions)

        return JsonResponse({"questions": questions}, status=200, safe=False)
    except Exception as e:
        return JsonResponse({"error": f"Failed to generate questions: {e}"}, status=500)


@csrf_exempt
def submit_answers_view(request):
    """
    POST /api/ai/submit/
    Body can be:
      { "answers": [ {"question": "...", "answer": "A"}, ... ] }
      or { "answers": { "<q1>": "A", "<q2>": "B", ... } }

    Responds with a simple score + normalized results so the Results page can render.
    (You can later replace this with real grading against correct keys.)
    """
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method."}, status=400)

    try:
        body = request.body.decode("utf-8") or "{}"
        data = json.loads(body)
        answers = data.get("answers")

        # Normalize answers to a list of {question, answer}
        if isinstance(answers, dict):
            answers_list = [{"question": q, "answer": a} for q, a in answers.items()]
        elif isinstance(answers, list):
            # ensure shape
            answers_list = []
            for item in answers:
                if isinstance(item, dict) and "question" in item and "answer" in item:
                    answers_list.append({"question": item["question"], "answer": item["answer"]})
        else:
            answers_list = []

        # Dummy scoring: give 75 if we received any answers, else 0
        score = 75 if answers_list else 0

        # Turn answers into "results" entries for UI (you can enrich later)
        results = [
            {
                "skill": _infer_skill_from_question(a["question"]),
                "score": 80,  # placeholder per item; replace with real grading later
                "category": "technical",
                "status": "good",
            }
            for a in answers_list
        ]

        return JsonResponse(
            {
                "score": score,
                "results": results,
            },
            status=200,
        )
    except Exception as e:
        return JsonResponse({"error": f"Failed to submit answers: {e}"}, status=500)


# -----------------
# Helpers
# -----------------
def _normalize_questions(raw):
    """
    Accepts:
      - dict with 'questions'
      - list at root
      - JSON string containing list or {questions: [...]}
    Returns: list[dict]
    """
    if raw is None:
        return []

    if isinstance(raw, list):
        return raw

    if isinstance(raw, dict):
        q = raw.get("questions")
        if isinstance(q, list):
            return q
        # sometimes model returns {"data":[...]}
        d = raw.get("data")
        if isinstance(d, list):
            return d
        return []

    if isinstance(raw, str):
        try:
            parsed = json.loads(raw)
            return _normalize_questions(parsed)
        except Exception:
            return [{"question": raw}]

    return []


def _infer_skill_from_question(q: str) -> str:
    """Very rough mapping to make Results UI look nice. Adjust as needed."""
    s = (q or "").lower()
    if "react" in s:
        return "React"
    if "python" in s:
        return "Python"
    if "sql" in s or "database" in s:
        return "SQL"
    if "project management" in s:
        return "Project Management"
    if "communication" in s:
        return "Communication"
    return "General"
