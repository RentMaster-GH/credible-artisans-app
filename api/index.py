import os
from fastapi import FastAPI
from supabase import create_client, Client

app = FastAPI(
    title="Credible Artisans API",
    description="FastAPI + Supabase backend deployed on Vercel.",
    version="1.0.0"
)

# Safely initialize Supabase without crashing if env vars are missing
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

supabase: Client | None = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Supabase init error: {e}")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "FastAPI backend running successfully on Vercel!"
    }