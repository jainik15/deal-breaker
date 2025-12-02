import chromadb
from chromadb.config import Settings
from langchain_text_splitters import RecursiveCharacterTextSplitter

# 1. Setup ChromaDB (In-memory for now, so it's fast and easy)
# We use a simple persistent path so data saves to your disk
chroma_client = chromadb.PersistentClient(path="./chroma_db")

def process_text_for_search(text: str, filename: str):
    """
    Takes raw text, splits it into chunks, and stores it in ChromaDB.
    """
    
    # 2. Split text into smaller chunks
    # We want chunks of 1000 characters with 200 overlap so context isn't lost
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    chunks = text_splitter.split_text(text)
    
    # 3. Get (or create) a collection for this file
    # A "Collection" in Chroma is like a Table in SQL
    collection = chroma_client.get_or_create_collection(name="contracts")
    
    # 4. Prepare data for insertion
    ids = [f"{filename}_chunk_{i}" for i in range(len(chunks))]
    metadatas = [{"filename": filename, "chunk_index": i} for i in range(len(chunks))]
    
    # 5. Add to Database
    # Chroma handles the embedding (converting text to numbers) automatically by default!
    collection.add(
        documents=chunks,
        metadatas=metadatas,
        ids=ids
    )
    
    return len(chunks)

def search_contract(query: str, filename: str, n_results=3):
    """
    Searches the database for the most relevant text chunks WITHIN a specific file.
    """
    collection = chroma_client.get_collection(name="contracts")
    results = collection.query(
        query_texts=[query],
        n_results=n_results,
        where={"filename": filename} # <--- THIS IS THE MAGIC FIX
    )
    
    # Safety check: If no results found, return empty list
    if not results['documents']:
        return []
        
    return results['documents'][0]