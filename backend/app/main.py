from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import router as api_router 
from app.services.vector_store import reset_collection

def get_application():
    _app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

    _app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"], 
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Inside the get_application() function, after app.add_middleware:

    @_app.on_event("startup")
    async def startup_event():
        # Reset the DB every time the server starts to prevent old data/chunk conflicts
        reset_collection()

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