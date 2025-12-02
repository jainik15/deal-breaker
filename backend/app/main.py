from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import router as api_router
from app.services.vector_store import reset_collection # 1. NEW IMPORT

def get_application():
    _app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

    # --- STARTUP HOOK: RUN ONCE WHEN DEPLOYED ---
    @_app.on_event("startup")
    async def startup_event():
        # 2. Reset the DB every time the server starts to prevent old data/chunk conflicts
        reset_collection()
    # ---------------------------------------------

    # --- CORS MIDDLEWARE ---
    # 3. Changed to "*" to allow connections from the live Frontend URL
    _app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"], 
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