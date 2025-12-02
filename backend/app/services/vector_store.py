import chromadb
from langchain_text_splitters import RecursiveCharacterTextSplitter

# 1. Setup ChromaDB (Persistent client)
# This client object is used by all functions below
chroma_client = chromadb.PersistentClient(path="./chroma_db")

def initialize_collection():
    """
    Ensures the 'contracts' collection exists when the server starts.
    """
    try:
        # This will create the collection if it doesn't exist
        chroma_client.get_or_create_collection(name="contracts")
        print("ChromaDB collection initialized.")
    except Exception as e:
        print(f"ChromaDB initialization failed: {e}")


def reset_collection():
    """
    Deletes and re-creates the 'contracts' collection for a clean slate.
    """
    try:
        # Delete and re-create to ensure no old data conflicts
        chroma_client.delete_collection(name="contracts")
        chroma_client.get_or_create_collection(name="contracts")
        print("ChromaDB collection reset successfully.")
    except Exception as e:
        print(f"ChromaDB reset failed: {e}")


def process_text_for_search(text: str, filename: str):
    """
    Takes raw text, splits it into chunks, and stores it in ChromaDB.
    """
    
    # 2. Split text into smaller chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    chunks = text_splitter.split_text(text)
    
    # 3. Get (or create) a collection for this file
    collection = chroma_client.get_or_create_collection(name="contracts")
    
    # 4. Prepare data for insertion
    ids = [f"{filename}_chunk_{i}" for i in range(len(chunks))]
    metadatas = [{"filename": filename, "chunk_index": i} for i in range(len(chunks))]
    
    # 5. Add to Database
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
        where={"filename": filename} # Filters the search to the specific file
    )
    
    # Safety check: If no results found, return empty list
    if not results['documents']:
        return []
        
    return results['documents'][0]