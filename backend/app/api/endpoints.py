from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from app.services.web_scraper import scrape_text_from_url
from app.services.pdf_reader import extract_text_from_pdf
from app.services.vector_store import process_text_for_search, search_contract
from app.services.llm_analyzer import analyze_clauses_with_ai, generate_negotiation_email, generate_bulk_negotiation_email, ask_ai_lawyer

router = APIRouter()

class NegotiationRequest(BaseModel):
    clause: str
    risk: str

class BulkNegotiationRequest(BaseModel):
    red_flags: list[dict]

class URLRequest(BaseModel):
    url: str

# --- NEW CHAT REQUEST MODEL ---
class ChatRequest(BaseModel):
    filename: str
    question: str
    history: list[dict] = [] # <--- NEW FIELD

@router.post("/analyze")
async def analyze_contract(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    # 1. Extract Pages (Returns [{'page':1, 'text':'...'}])
    pages_data = extract_text_from_pdf(file) 
    
    if not pages_data:
        raise HTTPException(status_code=400, detail="Could not read text from PDF")

    # 2. Combine for Vector DB (It needs one big string)
    full_text = "\n".join([p['text'] for p in pages_data])

    # 3. Vector Store (Index the file)
    try:
        process_text_for_search(full_text, file.filename)
    except Exception as e:
        print(f"Vector DB Warning: {e}") 

    # 4. Retrieval & Analysis
    query = "termination fees, penalties, data privacy, non-compete, indemnification, security deposit return"
    relevant_chunks = search_contract(query, file.filename, n_results=5)
    ai_result = analyze_clauses_with_ai(relevant_chunks)

    # 5. PAGE NUMBER MAPPING (The Logic Fix)
    # We search the original pages to find where the bad clause lives
    for flag in ai_result.get("red_flags", []):
        quote = flag.get("clause", "")
        # Take the first 30 chars of the quote to search
        search_snippet = quote[:30] 
        
        flag["page"] = 1 # Default
        for page in pages_data:
            if search_snippet in page['text']:
                flag["page"] = page['page']
                break

    return {
        "filename": file.filename,
        "analysis": ai_result 
    }
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

# --- NEW CHAT ENDPOINT ---
@router.post("/chat")
async def chat_with_document(request: ChatRequest):
    try:
        # 1. Search Vector DB for the specific question
        relevant_chunks = search_contract(request.question, request.filename, n_results=3)

        # 2. Ask the LLM (Now passing request.history)
        answer = ask_ai_lawyer(request.question, relevant_chunks, request.history)

        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-url")
async def analyze_url(request: URLRequest):
    # 1. Scrape the Web
    text_content = scrape_text_from_url(request.url)
    
    if not text_content or len(text_content) < 100:
        raise HTTPException(status_code=400, detail="Could not read content from this URL.")

    # 2. Create the internal filename
    clean_filename = request.url.replace("https://", "").replace("http://", "").replace("/", "_")[:50] + ".web"

    # 3. Vector Store
    try:
        process_text_for_search(text_content, clean_filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vector DB Error: {str(e)}")

    # 4. Retrieval & Analysis
    query = "termination fees, penalties, data privacy, non-compete, indemnification, security deposit return, data selling"
    relevant_chunks = search_contract(query, clean_filename, n_results=5)
    
    ai_result = analyze_clauses_with_ai(relevant_chunks)

    return {
        "filename": clean_filename, # <--- CHANGED THIS: Now sending the internal DB name
        "analysis": ai_result 
    }