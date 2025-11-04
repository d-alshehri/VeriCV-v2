from django.urls import path

from rest_framework.routers import DefaultRouter
from .views import QuizViewSet, QuestionViewSet, ResultViewSet
from django.urls import path, include

app_name = "quiz"

router = DefaultRouter()
router.register(r'quizzes', QuizViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'results', ResultViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path("generate/", generate_quiz, name="generate_quiz"),
    path("generate/", GenerateQuizView.as_view(), name="generate-quiz"),
    path("submit/",   SubmitQuizView.as_view(),   name="submit-quiz"),
    path("result/latest/", LatestResultView.as_view(), name="latest-result"),
]
