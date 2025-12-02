import json
import re
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from app.core.config import settings

# 1. Initialize Groq (The Fast AI Model)
# We use the updated model name here
llm = ChatGroq(
    temperature=0, 
    model_name="llama-3.3-70b-versatile", 
    api_key=settings.GROQ_API_KEY
)

def analyze_clauses_with_ai(retrieved_chunks: list):
    """
    Sends contract text to AI and asks for a risk assessment.
    """
    
    # 2. Combine the chunks into one block of text
    # We join them so the AI reads it as one continuous document context
    context_text = "\n\n".join(retrieved_chunks)
    
    # 3. The "Lawyer Persona" Prompt (The most important part!)
    system_prompt = """
    You are an expert strict lawyer. Your job is to review the following contract text.
    Identify any clauses that are dangerous, unfair, or predatory to the user.
    
    Specific Focus Areas:
    - Financial traps (hidden fees, non-refundable deposits)
    - Privacy violations (selling data)
    - Unfair termination rules
    - Liability waivers
    
    Output Format:
    You must return ONLY a valid JSON object. Do not add any conversational text.
    Structure:
    {{
        "safety_score": (integer 0-100),
        "summary": "One sentence summary of the contract vibe.",
        "red_flags": [
            {{
                "clause": "The exact text from the contract",
                "risk": "Why this is bad (Explain like I am 5)",
                "severity": "High" or "Medium"
            }}
        ]
    }}
    """
    
    # 4. Create the conversation
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", f"Here is the contract text:\n\n{context_text}")
    ])
    
    # 5. Run the chain
    chain = prompt | llm
    try:
        response = chain.invoke({})
        content = response.content
        
        # 6. Cleaning the Output (AI sometimes adds ```json at the start)
        # This regex looks for the JSON object inside the text
        json_match = re.search(r"\{.*\}", content, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(0))
        else:
            return json.loads(content)
            
    except Exception as e:
        print(f"AI Error: {e}")
        return {
            "safety_score": 0, 
            "summary": "Error analyzing contract.", 
            "red_flags": []
        }

def generate_negotiation_email(clause: str, risk: str):
    """
    Generates a polite but firm email to negotiate a specific bad clause.
    """
    system_prompt = """
    You are a professional legal negotiator. Your goal is to write a polite, professional, 
    and concise email to a landlord or employer requesting an amendment to a contract.
    
    Guidelines:
    - Tone: Respectful, cooperative, but firm on the issue.
    - Context: The user is worried about a specific clause.
    - Output: Just the body of the email. Keep it under 200 words.
    """
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", f"Please draft an email regarding this clause: '{clause}'. \nMy concern is: {risk}")
    ])
    
    chain = prompt | llm
    response = chain.invoke({})
    
    return response.content

def generate_bulk_negotiation_email(red_flags: list):
    """
    Generates one master email covering ALL identified risks.
    """
    # Convert list of dicts to a readable string bulleted list
    issues_text = ""
    for flag in red_flags:
        issues_text += f"- Clause: '{flag['clause']}'\n  Concern: {flag['risk']}\n\n"

    system_prompt = """
    You are a senior legal counsel acting on behalf of a client. 
    Your goal is to draft a formal, comprehensive negotiation email to a counterparty (Landlord/Employer).
    
    Instructions:
    1. Tone: Professional, firm, yet constructive. Use legal terminology where appropriate but keep it clear.
    2. Structure: 
       - Opening: Acknowledge receipt of the contract.
       - Body: systematically address the concerns listed below. Group them logically if possible.
       - Closing: Request a revised version of the agreement.
    3. Constraint: Do not be aggressive. The goal is to sign the deal, but with better terms.
    """
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", f"Please draft a comprehensive negotiation email addressing these specific issues:\n\n{issues_text}")
    ])
    
    chain = prompt | llm
    response = chain.invoke({})
    
    return response.content