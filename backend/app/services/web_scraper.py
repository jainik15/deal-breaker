import requests
from bs4 import BeautifulSoup

def scrape_text_from_url(url: str) -> str:
    """
    Fetches a webpage and extracts the readable legal text.
    """
    try:
        # 1. Fake a browser user agent (so websites don't block us)
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status() # Check for 404/500 errors
        
        # 2. Parse HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # 3. Remove junk (scripts, styles, navbars, footers)
        for script in soup(["script", "style", "nav", "footer", "header", "aside"]):
            script.decompose()
            
        # 4. Get text and clean it
        text = soup.get_text(separator="\n")
        
        # 5. Remove empty lines and extra spaces
        lines = (line.strip() for line in text.splitlines())
        clean_text = '\n'.join(chunk for chunk in lines if chunk)
        
        return clean_text
        
    except Exception as e:
        print(f"Scraping Error: {e}")
        return ""