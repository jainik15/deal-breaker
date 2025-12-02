from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.pdf_reader import extract_text_from_pdf
from app.services.vector_store import process_text_for_search, search_contract
from app.services.llm_analyzer import analyze_clauses_with_ai 

router = APIRouter()

@router.post("/analyze")
async def analyze_contract(file: UploadFile = File(...)):
    # 1. Read PDF
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    text_content = extract_text_from_pdf(file)
    if not text_content:
        raise HTTPException(status_code=400, detail="Could not read text")

    # 2. Vector Store (Index the file)
    try:
        process_text_for_search(text_content, file.filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vector DB Error: {str(e)}")

    # 3. Retrieval (Find the juicy parts)
    # We search for broad legal terms to capture the dangerous sections
    query = "termination fees, penalties, data privacy, non-compete, indemnification, security deposit return"
    
    # We pass 'file.filename' to ensure we only search THIS document
    relevant_chunks = search_contract(query, file.filename, n_results=5)

    # 4. AI Analysis (The Judge)
    ai_result = analyze_clauses_with_ai(relevant_chunks)

    return {
        "filename": file.filename,
        "analysis": ai_result 
    }