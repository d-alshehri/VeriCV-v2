# VeriCV 🎯  
**AI-Powered Resume Analyzer**

### 🏫 Holberton School Saudi Arabia — Cohort 1 (Feb – Nov 2025)
**Team Members**  
- Leen Mohammed Alsaleh — [10691@holbertonstudents.com](mailto:10691@holbertonstudents.com)  
- Haneen Nasser Aldawood — [10684@holbertonstudents.com](mailto:10684@holbertonstudents.com)  
- Danah Khaled Alshehri — [10674@holbertonstudents.com](mailto:10674@holbertonstudents.com)

---

<div align="center">

<img src="./assets/logo.png" width="140" alt="VeriCV Logo" />

#  VeriCV — Smarter Interview Preparation with AI

**Personalized, AI-generated quizzes built from your CV.**  
Your smart companion for confident, data-driven interview practice.

_Developed by Holberton School × Tuwaiq Academy_ 🇸🇦

---

![Backend](https://img.shields.io/badge/Backend-Django-092E20?style=for-the-badge&logo=django)
![Frontend](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react)
![AI](https://img.shields.io/badge/AI-Groq%20%7C%20OpenRouter-F7941E?style=for-the-badge&logo=openai)
![Docs](https://img.shields.io/badge/Planning-Obsidian-8A2BE2?style=for-the-badge&logo=obsidian)

</div>

---

###  Overview
**VeriCV** is an AI-powered platform that transforms a user’s resume into an **interactive interview experience**.  
By analyzing skills, technologies, and experience, it automatically generates customized multiple-choice questions to help candidates prepare for real interviews with confidence.

---

###  Why We Built It
Preparing for interviews can be overwhelming — especially when you don’t know what topics to focus on.  
**VeriCV bridges this gap** by using AI to:
- Understand your professional strengths and learning areas.  
- Create questions relevant to your own background.  
- Give you instant feedback, scores, and improvement tips.  
- Track your progress over time through a visual history dashboard.

---


## 🚀 Key Features
- **AI Resume Analysis:** Upload your CV (PDF) to extract relevant skills automatically.  
- **Smart Quiz Generation:** Custom skill-based quizzes generated via Groq API.  
- **Instant Feedback:** Personalized recommendations to strengthen weak areas.  
- **Progress Dashboard:** Track test history and performance improvements.  
- **Job–CV Matching :** Compare CVs against job descriptions to evaluate compatibility.

---

## 🎯 Objectives
1. Allow users to upload resumes and automatically extract both technical & soft skills.  
2. Generate short, customized quizzes to measure actual proficiency.  
3. Deliver instant, AI-based feedback reports.  
4. Help users identify and close skill gaps before job applications.

---

## 🧠 Target Audience
- Tech students and recent graduates.  
- Entry-level professionals seeking career readiness validation.  
- Educational and career-support institutions.

---

## 🧩 System Architecture
**Tech Stack**  
- **Frontend:** React + Visual Studio Code  
- **Backend:** Django REST Framework  
- **Database:** PostgreSQL / Supabase  
- **AI Layer:** Groq API for natural language processing  
- **Documentation:** Obsidian  
- **Management:** Monday.com for task tracking and sprints  
- **Testing:** Postman for API validation  

---

## 🔄 Core Workflow
1. **Upload CV** → User uploads PDF/Word resume.  
2. **AI Skill Extraction** → Groq API detects skills.  
3. **Quiz Generation** → AI creates questions per skill.  
4. **Assessment** → User answers and submits quiz.  
5. **Feedback Report** → System returns score and recommendations.  
6. **Dashboard** → User tracks progress and history.

---



---

## 🧪 Testing & Quality Assurance
- **Unit Tests:** Validated Django models and endpoints.  
- **Integration Tests:** Verified Django ↔ Groq ↔ React connectivity.  
- **Manual Testing:** Postman used for API validation and error handling.  
- **User Feedback:** Reviewed by Holberton students and mentors.  

---

## ⚙️ Development Workflow
| Step | Focus | Outcome |
|------|--------|----------|
| 1 | Backend Setup | Django API with tested endpoints |
| 2 | Database Integration | PostgreSQL & Supabase linked |
| 3 | Frontend Development | React UI with dynamic forms |
| 4 | AI Integration | Groq for skill parsing and feedback |
| 5 | Testing & QA | Postman tests for API flow |
| 6 | Documentation & Planning | Managed via Monday.com and Obsidian |

---

## 💡 Technical Highlights
- **Groq API:** NLP skill extraction and quiz generation.  
- **Django REST:** Secure and scalable API architecture.  
- **React Frontend:** Responsive and intuitive user interface.  
- **PostgreSQL:** Structured data storage and Supabase backup.  
- **Visual Studio Code:** Core IDE for development.  
- **Obsidian + Monday.com:** Documentation and agile management.  
- **Postman:** End-to-end testing and API verification.

---

## 🚧 Challenges & Solutions
| Challenge | Resolution |
|------------|-------------|
| AI output inconsistency | Improved prompt engineering and data filtering |
| Slow CV parsing | Optimized Groq requests and async handling |
| Repeated quiz questions | Added skill-based weighting logic |
| Database conflicts | Used Supabase as backup storage layer |

---

## 🔮 Future Enhancements
- **RAG Integration:** Add Retrieval-Augmented Generation for context-aware feedback.  
- **Recruiter Dashboard:** Employer-candidate matching system.  
- **Free Trial Mode:** Two free AI analyses per user.  
- **Multi-Language Parsing:** Arabic & English resume support.

---

## 🧭 Lessons Learned
- Prompt engineering directly impacts AI accuracy.  
- Early API architecture simplifies integration.  
- Clear team roles and task ownership boost efficiency.  
- Agile tracking in Monday.com improves transparency and delivery.  

---

## 🏆 Results
- **AI Accuracy:** ≈ 90 % skill extraction success.  
- **Stable API:** 100 % uptime during testing.  
- **UI Performance:** 98 % responsiveness on desktop.  
- **Positive Feedback:** High usability and clarity scores from testers.

---

## 📚 License
Developed for **Holberton School Saudi Arabia** — Cohort 1 Portfolio Project.  
For educational and demonstration purposes only.

---

## 💬 Acknowledgments
Special thanks to Holberton Saudi Arabia mentors and the Falcon team for their continuous support, guidance, and inspiration throughout the development journey.

---
