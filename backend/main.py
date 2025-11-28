from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
import os
from typing import List
import shutil
from datetime import datetime
from rag_engine import process_batch_pdfs, get_answer_context
# IMPORTfor Free Web Search
from duckduckgo_search import DDGS

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv() 

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    print("ERROR: GROQ_API_KEY not found!")
client = Groq(api_key=GROQ_API_KEY)

class QueryRequest(BaseModel):
    question: str

def is_index_available():
    """Checks if the FAISS index folder exists."""
    return os.path.exists("faiss_index")

@app.post("/upload")
async def upload_documents(files: List[UploadFile] = File(...)):
    os.makedirs("uploads", exist_ok=True)
    saved_file_paths = []
    
    for file in files:
        if file.filename:
            file_location = os.path.join("uploads", file.filename)
            with open(file_location, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            saved_file_paths.append(file_location)
    
    if not saved_file_paths:
        raise HTTPException(status_code=400, detail="No files were uploaded or files were empty.")

    success, message = process_batch_pdfs(saved_file_paths) 
    
    for file_path in saved_file_paths:
        try:
            os.remove(file_path)
        except Exception as e:
            print(f"Cleanup error: {e}")

    if not success:
        raise HTTPException(status_code=500, detail=message)
        
    return {"message": message, "filenames": [os.path.basename(f) for f in saved_file_paths]}

@app.post("/chat")
async def chat_with_pdf(request: QueryRequest):
    
    # CHECK the INDEX BEFORE ANY PROCESSING ---
    if not is_index_available():
        # Handle politely
        greeting_words = ["hello", "hi", "hey", "good morning", "thanks", "thank you", "ok", "bye"]
        if any(word in request.question.lower().strip() for word in greeting_words):
             return {"response": "Hello! I am FinRAG, ready to analyze your documents. Please upload a PDF file first to begin.", "source_context": ""}
        
        # Block all other queries
        return {
            "response": "I cannot answer your question yet. Please upload a PDF file to the sidebar first to build the document knowledge base.",
            "source_context": ""
        }
    
    # first, try to get context from the document
    context = get_answer_context(request.question)
    source_type = "document" 
    
    # If no context from document, try web search
    if not context:
        print("Context not found in PDF. Switching to Web Search...")
        web_results = search_web(request.question)
        if web_results:
            context = web_results
            source_type = "web"
        else:
            source_type = "none"

    current_date = datetime.now().strftime("%B %Y")

    # Construct Prompt
    prompt = f"""
    You are FinRAG, an elite Enterprise Document Assistant.
    TODAY'S DATE: {current_date}
    SOURCE TYPE: {source_type.upper()}

    ### CORE INSTRUCTIONS:
    Answer based ONLY on the source type provided.
    
    ### 1. IF SOURCE = 'DOCUMENT':
    - **Strict Retrieval:** Answer ONLY using the text provided in CONTEXT.
    - **Citations:** You MUST cite the page number or section (e.g., "According to Page 5...").
    - **No Hallucination:** If the answer is not in the text, say: "Information not found in the document."
    - **Formatting:** Summarize long sections. Do not copy huge text blocks. Use bullet points for lists.

    ### 2. IF SOURCE = 'WEB':
    - Summarize the provided search results.
    - Start with: "Based on web search results..."
    - Cite the source name if available.

    ### 3. IF SOURCE = 'NONE' (Context is Empty):
    - **Greetings:** Reply politely to "Hello/Hi".
    - **Definitions:** Use your Internal Knowledge for definitions (e.g., "What is AI?"). Start with: "(General Knowledge):".
    - **Specific Data:** If asking for specific details (e.g., "Revenue?", "CEO?"), refuse politely: "Information not found."
    - **Garbage Input:** If input is "1234" or gibberish, ask for clarification.

    ### 4. LANGUAGE RULE:
    - Respond in the SAME language as the user's question (English -> English, Hindi -> Hindi).

    ---
    CONTEXT ({source_type}):
    {context}
    ---

    USER QUESTION: {request.question}
    """
    
    chat_completion = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.1-8b-instant",
        temperature=0,
    )
    
    response_text = chat_completion.choices[0].message.content

    # Prepare source context for response
    final_source = context
    if source_type == "web":
        final_source = "🌐 **Fetched from Web:**\n" + context
    elif source_type == "none" or "information not found" in response_text.lower():
        final_source = ""

    return {"response": response_text, "source_context": final_source}

def search_web(query):
    try:
        skip_words = ["hello", "hi", "hey", "thanks", "ok", "bye"]
        if query.lower().strip() in skip_words or len(query.strip()) < 3:
            return ""

        print(f"Searching Web for: {query}")
        results = DDGS().text(query, region='wt-wt', safesearch='moderate', max_results=3)
        
        if results:
            return "\n\n".join([f"Source: {r['title']}\nSnippet: {r['body']}\nLink: {r['href']}" for r in results])
        return ""
    except Exception as e:
        print(f"Web Search Error: {e}")
        return ""

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)