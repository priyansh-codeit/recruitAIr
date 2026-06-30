# RecruitAIr

**RecruitAIr** is an AI-powered recruiter assistant built for the **Cognee Hackathon**.

Unlike traditional Applicant Tracking Systems (ATS), RecruitAIr doesn't just filter resumes using keywords—it builds persistent memory of candidates and recruiter preferences using **Cognee**. Over time, it learns how recruiters make hiring decisions and provides increasingly personalized candidate recommendations.

---

## 🚀 Features

- 📄 Upload and parse resumes (PDF)
- 🧠 Store structured candidate information using Cognee
- 🔍 Natural language candidate search
- 🤖 AI-powered resume understanding using Mistral
- 📊 Intelligent candidate ranking
- 💡 Explain why candidates were recommended
- 📈 Learn recruiter preferences over time

---

## 🏗️ Tech Stack

### Frontend
- React

### Backend
- FastAPI
- Python

### AI
- Gemini via inference api keys

### Memory
- Cognee

### Resume Processing
- PyMuPDF

---

## 📂 Project Structure

```
RecruitAIr/
│
├── backend/
│   ├── app/
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│
├── uploads/
│
├── docs/
│
├── .gitignore
└── README.md
```

---

## ⚙️ Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd RecruitAIr
```

---

### 2. Create a virtual environment

Windows

```bash
python -m venv .venv
.venv\Scripts\activate
```

Linux / macOS

```bash
python3 -m venv .venv
source .venv/bin/activate
```

---

### 3. Install dependencies

```bash
pip install -r backend/requirements.txt
```

---

### 4. Configure environment variables

Create a `.env` file inside the backend directory.

Example:

```env
HF_TOKEN=your_huggingface_token
HF_MODEL=mistralai/Mistral-7B-Instruct-v0.3
LLM_PROVIDER=huggingface
TEMPERATURE=0.2
HOST=127.0.0.1
PORT=8000
```

---

### 5. Start the backend

```bash
uvicorn app.main:app --reload
```

The API will be available at

```
http://127.0.0.1:8000
```

Interactive documentation:

```
http://127.0.0.1:8000/docs
```

---

## 🎯 Project Vision

RecruitAIr aims to move beyond keyword-based resume screening by leveraging persistent AI memory.

The system can:

- Remember candidate information
- Understand recruiter preferences
- Improve recommendations through interactions
- Explain hiring recommendations transparently

This showcases Cognee's **Remember → Recall → Improve** workflow in a practical recruiting application.

---

## 👥 Team

- **Ranak** — AI Integration & Prompt Engineering
- **Aayan** — Backend Development
- **Harshit** — Cognee Integration & Memory
- **Priyansh** — Frontend Development

---

## 📌 Current Status

🚧 Under active development for the Cognee Hackathon.
