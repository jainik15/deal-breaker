from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel # <--- NEW IMPORT
from app.services.pdf_reader import extract_text_from_pdf
from app.services.vector_store import process_text_for_search, search_contract
from app.services.llm_analyzer import analyze_clauses_with_ai, generate_negotiation_email 
from app.services.llm_analyzer import analyze_clauses_with_ai, generate_negotiation_email, generate_bulk_negotiation_email

router = APIRouter()

# --- NEW DATA MODEL ---
class NegotiationRequest(BaseModel):
    clause: str
    risk: str
class BulkNegotiationRequest(BaseModel):
    red_flags: list[dict]

@router.post("/analyze")
async def analyze_contract(file: UploadFile = File(...)):
    # 1. Read PDF
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    text_content = extract_text_from_pdf(file)
    if not text_content:
        raise HTTPException(status_code=400, detail="Could not read text")

    # 2. Vector Store
    try:
        process_text_for_search(text_content, file.filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vector DB Error: {str(e)}")

    # 3. Retrieval
    query = "termination fees, penalties, data privacy, non-compete, indemnification, security deposit return"
    relevant_chunks = search_contract(query, file.filename, n_results=5)

    # 4. AI Analysis
    ai_result = analyze_clauses_with_ai(relevant_chunks)

    return {
        "filename": file.filename,
        "analysis": ai_result 
    }

# --- NEW ENDPOINT ---
@router.post("/negotiate")
async def negotiate_clause(request: NegotiationRequest):
    try:
        email_draft = generate_negotiation_email(request.clause, request.risk)
        return {"email": email_draft}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/negotiate-all")
async def negotiate_all_clauses(request: BulkNegotiationRequest):
    try:
        email_draft = generate_bulk_negotiation_email(request.red_flags)
        return {"email": email_draft}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))