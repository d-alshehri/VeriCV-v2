from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Assessment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    position = models.CharField(max_length=255)
    average_score = models.FloatField()
    skills_analyzed = models.JSONField()
    date_created = models.DateTimeField(auto_now_add=True)

    def top_skills(self):
        if not self.skills_analyzed:
            return []
        sorted_skills = sorted(self.skills_analyzed.items(), key=lambda x: x[1], reverse=True)
        return [skill for skill, _ in sorted_skills[:4]]
