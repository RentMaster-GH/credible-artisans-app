import os
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
from supabase import create_client, Client

app = FastAPI(
    title="Credible Artisans API",
    description="FastAPI + Supabase backend deployed on Vercel.",
    version="1.0.0"
)

# Read environment variables set in Vercel
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    supabase = None
else:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "FastAPI backend running successfully on Vercel!"
    }