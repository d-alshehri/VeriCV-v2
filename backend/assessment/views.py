from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Avg, Max, Count
from .models import Assessment
from .serializers import AssessmentSerializer

class AssessmentSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            qs = Assessment.objects.filter(user=request.user)
            agg = qs.aggregate(
                total=Count("id"),
                average_score=Avg("average_score"),
                last_assessment_date=Max("date_created"),
            )

            # Build a tolerant payload (never 500)
            avg = agg.get("average_score")
            last = agg.get("last_assessment_date")

            # Optional: compute a top skill safely
            all_skills = {}
            for a in qs:
                for skill, score in (a.skills_analyzed or {}).items():
                    all_skills[skill] = max(all_skills.get(skill, 0), score)
            top_skill = max(all_skills, key=all_skills.get) if all_skills else None

            payload = {
                "total": agg.get("total") or 0,
                "total_assessments": agg.get("total") or 0,
                "average_score": float(avg) if avg is not None else None,
                "last_assessment_date": last.isoformat() if last else None,
                # Keep legacy fields for frontend compatibility
                "last_activity": last.isoformat() if last else None,
                "top_skill": top_skill,
            }
            return Response(payload, status=status.HTTP_200_OK)
        except Exception:
            return Response({
                "total": 0,
                "total_assessments": 0,
                "average_score": None,
                "last_assessment_date": None,
                "last_activity": None,
                "top_skill": None,
            }, status=status.HTTP_200_OK)


class AssessmentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            assessments = (
                Assessment.objects
                .filter(user=request.user)
                .order_by("-date_created")
            )
            serializer = AssessmentSerializer(assessments, many=True)
            return Response({"results": serializer.data}, status=status.HTTP_200_OK)
        except Exception:
            # Never 500 the dashboard; fail safe with empty list
            return Response({"results": []}, status=status.HTTP_200_OK)
    
from rest_framework import status

class AssessmentCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        data = request.data

        # Extract expected fields
        position = data.get("position")
        average_score = data.get("average_score")
        skills_analyzed = data.get("skills_analyzed")

        # Basic validation
        if not all([position, average_score, skills_analyzed]):
            return Response(
                {"error": "position, average_score, and skills_analyzed are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create the record
        assessment = Assessment.objects.create(
            user=user,
            position=position,
            average_score=average_score,
            skills_analyzed=skills_analyzed
        )

        serializer = AssessmentSerializer(assessment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
