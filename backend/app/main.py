from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import router as api_router
from app.services.vector_store import reset_collection 

def get_application():
    _app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

    # --- REMOVED STARTUP HOOK: Database Reset is now optional ---
    # To run reset locally, manually call reset_collection() 
    
    # --- CORS MIDDLEWARE: RESTRICTED TO LOCALHOST ---
    # The React Frontend runs on 5173, the local dev port
    _app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"], 
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    _app.include_router(api_router, prefix="/api/v1")

    return _app

app = get_application()

@app.get("/")
def home():
    return {
        "message": "Welcome to Deal-Breaker API",
        "status": "active",
        "version": settings.VERSION
    }