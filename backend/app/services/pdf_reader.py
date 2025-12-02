import pypdf
from fastapi import UploadFile

def extract_text_from_pdf(file_file: UploadFile) -> str:
    """
    Reads a PDF file stream and returns the full text content.
    """
    try:
        # pypdf needs a real file-like object, so we read the stream
        pdf_reader = pypdf.PdfReader(file_file.file)
        
        full_text = ""
        for page in pdf_reader.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"
                
        return full_text
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return ""