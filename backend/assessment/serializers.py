from rest_framework import serializers
from .models import Assessment

class AssessmentSerializer(serializers.ModelSerializer):
    top_skills = serializers.SerializerMethodField()
    skills_analyzed_count = serializers.SerializerMethodField()

    class Meta:
        model = Assessment
        fields = [
            "id",
            "position",
            "date_created",
            "average_score",
            "skills_analyzed_count",
            "top_skills",
        ]

    def get_top_skills(self, obj):
        return obj.top_skills()

    def get_skills_analyzed_count(self, obj):
        return len(obj.skills_analyzed.keys()) if obj.skills_analyzed else 0
