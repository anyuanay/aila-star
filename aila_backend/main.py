from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import fitz  # PyMuPDF
from supabase import create_client, Client

# Load environment variables
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Only set Google API key if it exists (optional for now)
google_api_key = os.getenv("GOOGLE_API_KEY")
if google_api_key:
    os.environ["GOOGLE_API_KEY"] = google_api_key

class ProcessLectureRequest(BaseModel):
    filename: str
    course_id: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def download_from_supabase(bucket: str, file_path: str, save_as: str):
    response = supabase.storage.from_(bucket).download(file_path)
    if not response:
        raise HTTPException(status_code=404, detail="File not found in Supabase Storage")
    with open(save_as, "wb") as f:
        f.write(response)

def extract_text_segments(pdf_path):
    doc = fitz.open(pdf_path)
    segments = []
    for page in doc:
        text = page.get_text(sort=True)
        segments.append(text)
    return segments

@app.post("/process-lecture/")
async def process_lecture(request: ProcessLectureRequest):
    filename = request.filename
    course_id = request.course_id
    bucket = "lecture-materials"
    supabase_path = f"{course_id}/{filename}"
    local_path = f"uploads/{course_id}_{filename}"
    os.makedirs("uploads", exist_ok=True)
    try:
        download_from_supabase(bucket, supabase_path, local_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")
    
    segments = extract_text_segments(local_path)
    
    # Simple text processing instead of LlamaIndex for now
    summaries = []
    for segment in segments[:2]:  # Limit for demo
        # Simple summary (first 200 chars)
        summary = segment[:200] + "..." if len(segment) > 200 else segment
        summaries.append(summary)
    
    return {
        "status": "processed",
        "filename": filename,
        "num_segments": len(segments),
        "summaries": summaries,
        "segments": segments[:2],  # Return first 2 segments for demo
    }

@app.get("/")
async def root():
    return {"message": "AILA Backend is running"}
 