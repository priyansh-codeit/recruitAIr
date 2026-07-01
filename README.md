# RecruitAIr

**RecruitAIr** is an AI-powered recruiter assistant built for the **Cognee Hackathon**.

Live website: https://priyansh-codeit.github.io/recruitAIr

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
- Vite

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
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── schemas.py
│   │   └── utils.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   └── style.css
│
├── docs/
│   └── vision.md
├── .gitignore
└── README.md
```

---

## ⚙️ Setup

### 1. Create a backend virtual environment

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

### 2. Install backend dependencies

```bash
pip install -r backend/requirements.txt
```

---

### 3. Configure backend environment

Create `backend/.env` from `backend/.env.example`.

Example:

```env
HF_TOKEN=your_huggingface_token
HF_MODEL=mistralai/Mistral-7B-Instruct-v0.3
LLM_PROVIDER=huggingface
COGNEE_API_KEY=your_cognee_api_key
COGNEE_ENDPOINT=https://api.cognee.ai
TEMPERATURE=0.2
HOST=127.0.0.1
PORT=8000
```

---

### 4. Start the backend

```bash
cd backend
uvicorn app.main:app --reload
```

The backend will be available at `http://127.0.0.1:8000`.

---

### 5. Start the frontend

Open a separate terminal and run:

```bash
cd frontend
npm install
npm run dev
```

---

## 🎯 How to proceed

1. Implement the backend upload endpoint and candidate search logic.
2. Connect the frontend upload form to the backend.
3. Replace stub candidate parsing with real PyMuPDF extraction logic.
4. Add Cognee memory integration in the backend to store recruiter preferences.
5. Expand frontend UI with real search, filtering, and Graph Explorer components.

---

## 👥 Team

- **Ranak** — AI Integration & Prompt Engineering
- **Aayan** — Backend Development
- **Harshit** — Cognee Integration & Memory
- **Priyansh** — Frontend Development

---

## 🌐 Live Demo

Deploy the frontend on Vercel, Netlify, or any static host and point it to the backend API URL.

Example live link placeholder:
- https://recruitair.vercel.app

## 📤 Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/priyansh-codeit/recruitAIr.git
git push -u origin main
```

## 📌 Current Status

🚧 Under active development for the Cognee Hackathon.
