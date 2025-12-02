from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import router as api_router 

def get_application():
    _app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

    _app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"], 
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    _app.include_router(api_router, prefix="/api/v1") # <--- NEW LINE 2

    return _app

app = get_application()

@app.get("/")
def home():
    return {
        "message": "Welcome to Deal-Breaker API",
        "status": "active",
        "version": settings.VERSION
    }