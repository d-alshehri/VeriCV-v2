from datetime import timedelta
from django.conf import settings
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from ai.ai_logic import generate_questions_from_cv
# If you persist attempts, import your model and wire it up.

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def generate_quiz(request):
    """
    Generates a quiz from the user's CV and returns:
      - questions (already capped server-side)
      - seconds_per_question (settings)
      - max_questions (settings)
      - duration_seconds (len(questions) * seconds_per_question)
      - deadline_iso (server time; authoritative)
    """
    # TODO: Replace this with how you actually retrieve the CV text for the user.
    # e.g., cv_text = CV.objects.get(user=request.user).text or similar.
    cv_text = request.query_params.get("cv_text", "")

    # Optional desired count from client (?count=); backend still clamps.
    requested = request.query_params.get("count")
    try:
        requested_count = int(requested) if requested is not None else settings.QUIZ_DEFAULT_QUESTIONS
    except ValueError:
        requested_count = settings.QUIZ_DEFAULT_QUESTIONS

    questions = generate_questions_from_cv(cv_text=cv_text, requested_count=requested_count)

    seconds_per_q = getattr(settings, "QUIZ_SECONDS_PER_QUESTION", 60)
    duration_seconds = max(0, len(questions) * seconds_per_q)
    deadline = timezone.now() + timedelta(seconds=duration_seconds)

    # If you have a QuizAttempt model, you can create and return an attempt_id here.
    # attempt = QuizAttempt.objects.create(
    #     user=request.user,
    #     question_count=len(questions),
    #     duration_seconds=duration_seconds,
    #     deadline=deadline,
    #     payload={"questions": questions},
    # )

    return Response({
        "questions": questions,
        "seconds_per_question": seconds_per_q,
        "max_questions": settings.QUIZ_MAX_QUESTIONS,
        "duration_seconds": duration_seconds,
        "deadline_iso": deadline.isoformat(),
        # "attempt_id": attempt.id,
    }, status=status.HTTP_200_OK)
