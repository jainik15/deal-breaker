import pypdf
from fastapi import UploadFile

def extract_text_from_pdf(file_file: UploadFile):
    """
    Reads a PDF and returns a list of dictionaries: [{'page': 1, 'text': '...'}, ...]
    """
    pages_data = []
    try:
        # Reset file cursor to the beginning just in case
        file_file.file.seek(0)
        
        pdf_reader = pypdf.PdfReader(file_file.file)
        
        for i, page in enumerate(pdf_reader.pages):
            text = page.extract_text()
            if text:
                # Clean up text slightly to match easier
                clean_text = text.replace('\n', ' ').replace('  ', ' ')
                pages_data.append({"page": i + 1, "text": clean_text})
                
        return pages_data
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return []