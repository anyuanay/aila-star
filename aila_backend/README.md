# AILA Backend

This is the backend for the AILA STAR research project at Drexel University, Summer 2025.

## Overview

This backend is built with **FastAPI** and integrates with Supabase (for authentication and storage) and Google Gemini (for LLM summarization and knowledge extraction).  
---

## Features

- **Lecture Material Upload:** Receives filenames from the frontend after upload to Supabase Storage.
- **Content Parsing:** Extracts text from PDFs (PyMuPDF) and PowerPoints (python-pptx).
- **LLM Summarization:** Uses Gemini LLM (via LlamaIndex) to summarize each lecture segment.
- **API Endpoints:** Designed for easy extension (retrieval practice, chat, knowledge graph, etc.).
- **Secure Environment:** All secrets managed via `.env` (never committed).

---

## Getting Started

### 1. Clone the Repository

git clone https://github.com/yourusername/aila_backend.git
cd aila_backend

### 2. Set Up the Virtual Environment

python3 -m venv .venv
source .venv/bin/activate

### 3. Install Dependencies

pip install --upgrade pip
pip install fastapi uvicorn python-multipart PyMuPDF python-pptx supabase llama-index==0.12.45 llama-index-llms-gemini==0.5.0 google-generativeai

### 4. Configure Environment Variables

- Create a `.env` file in the backend root:

SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GOOGLE_API_KEY=your_gemini_api_key



### 5. Run the Server

uvicorn main:app --reload

- API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## API Endpoints

- `GET /` – Health check
- `POST /process-lecture/` – Process a lecture file (PDF or PPTX), extract segments, and summarize with Gemini

---

## Project Structure

aila_backend/
├── main.py
├── .env
├── requirements.txt
└── ...

## License

MIT License

