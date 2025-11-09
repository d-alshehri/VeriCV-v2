import os
import json
import requests
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from pdf2image import convert_from_path
import pytesseract
import tempfile
import re
import logging
import time

# Setup logging instead of print statements
logger = logging.getLogger(__name__)

# Load API key
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# --- Extract Text ---
def extract_text_from_pdf(file):
    """Extract text from a PDF file (supports OCR for scanned resumes)."""
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
        for chunk in file.chunks():
            tmp_file.write(chunk)
        temp_path = tmp_file.name

    text = ""
    try:
        reader = PdfReader(temp_path)
        for page in reader.pages:
            text += page.extract_text() or ""

        if not text.strip():
            logger.info("No text detected — switching to OCR mode...")
            images = convert_from_path(temp_path)
            for img in images:
                text += pytesseract.image_to_string(img)

        logger.info(f"Extracted text preview: {text[:400]}")
        return text[:4000]
    finally:
        os.remove(temp_path)


# --- Generate Quiz Questions ---
def generate_questions_from_cv(cv_text):
    """Send resume text to Groq API and generate professional questions."""
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    prompt = f"""
You are an experienced HR and technical interviewer working for an AI-powered resume assessment platform called VeriCV.
Analyze the following resume content carefully:
---
{cv_text}
---
Extract all *technical* and *soft* skills mentioned or implied.
For each extracted skill, generate **3 multiple-choice questions (MCQs)**:
1 easy question
1 medium question
1 difficult question
Each question must include:
"question": the question text
"options": a list of 4 possible answers
"correct_index": integer 0–3 (index of correct option)
"skill": the specific skill being tested
"difficulty": "easy", "medium", or "hard"
"category": "technical" or "soft" (based on skill type)
Output format example:
[
  {{
    "question": "Which command initializes a Git repository?",
    "options": ["git init", "git start", "git new", "git repo"],
    "correct_index": 0,
    "skill": "Git",
    "difficulty": "easy",
    "category": "technical"
  }}
]
Return ONLY this JSON array — no markdown, no extra text.
"""
    data = {"model": "groq/compound", "messages": [{"role": "user", "content": prompt}]}

    for attempt in range(3):
        response = requests.post(url, headers=headers, json=data, timeout=45)
        if response.status_code == 429:
            logger.warning(":warning: Groq rate limit hit. Retrying in 3 seconds...")
            time.sleep(3)
            continue
        break

    if response.status_code == 200:
        content = response.json()["choices"][0]["message"]["content"]
        logger.info(f"Raw model output: {content[:500]}")
        match = re.search(r"(\{.*\}|\[.*\])", content, re.DOTALL)
        if match:
            content = match.group(1).strip()

        try:
            return json.loads(content)
        except json.JSONDecodeError:
            logger.warning("JSON parsing failed. Attempting cleanup...")
            cleaned = content.strip().replace("```json", "").replace("```", "")
            try:
                return json.loads(cleaned)
            except Exception:
                logger.error(f"Invalid JSON after cleanup: {cleaned[:500]}")
                return []
    else:
        logger.error(f"Groq API Error ({response.status_code}): {response.text}")
        return []


# --- Generate Feedback ---
def generate_feedback_from_ai(wrong_answers, percent):
    """Generate professional feedback based on user's wrong answers."""
    if not wrong_answers:
        return "Excellent work! You answered all questions correctly. "

    summary = f"Score: {percent:.1f}%\nIncorrect answers:\n"
    for w in wrong_answers:
        summary += f"- Question: {w['question']}\nYour answer: {w['chosen']}\nCorrect: {w['correct']}\n"

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}

    prompt = f"""
You are a career coach and HR expert.

The candidate scored {percent:.1f}% on a professional interview test.
Here are the incorrect questions:
{summary}

Write feedback that:
- Identifies improvement areas.
- Gives clear, practical advice.
- Encourages and motivates the candidate.
"""

    data = {"model": "groq/compound-mini", "messages": [{"role": "user", "content": prompt}]}
    response = requests.post(url, headers=headers, json=data, timeout=30)

    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    else:
        return f"Error while generating feedback: {response.text}"


# --- Job Match Analysis (Placeholder for AI Team) ---
def analyze_job_match(cv_text, job_description, position):
    """
    This is a placeholder for the AI team's Job Matching logic.

    The AI engineer should implement logic that:
    1. Compares the candidate's CV with the job description and position title.
    2. Calculates a match score (0–100).
    3. Extracts missing or recommended keywords.
    4. Generates a professional, short summary.

    The function must return a Python dictionary in the following format:
    {
        "match_score": <int>,
        "missing_keywords": [<list of strings>],
        "summary": "<string>"
    }
    """
    # Temporary placeholder until the AI engineer adds their model
    return {
        "match_score": 0,
        "missing_keywords": [],
        "summary": "Job match AI model not yet implemented.",
    }
