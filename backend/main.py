"""
ForeSite - Predictive Land-Change Intelligence System
Backend FastAPI Application Entrypoint
"""

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from data.db import init_db
from api.parcels import router as parcels_router
from api.alerts import router as alerts_router
from api.statistics import router as statistics_router
from api.actions import router as actions_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database and seed parcels on startup
    init_db(force_reseed=False)
    yield

app = FastAPI(
    title="ForeSite - Predictive Land-Change Intelligence System",
    description="Multi-temporal Earth Observation Land-Use Change Detection & Enforcement Prioritization System",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local React frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://foresite-blue.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(parcels_router)
app.include_router(alerts_router)
app.include_router(statistics_router)
app.include_router(actions_router)

@app.get("/")
def root():
    return {
        "system": "ForeSite - Predictive Land-Change Intelligence System",
        "status": "Operational",
        "hackathon": "Smart India Hackathon 2026",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    import sys
    import os
    # Add script directory to python path for uvicorn reloader compatibility
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
