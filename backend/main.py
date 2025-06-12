from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv, set_key
import os
from typing import Optional
import PyPDF2
import io

# Load environment variables
load_dotenv()

app = FastAPI(title="AI Chat API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper function to get API key
def get_api_key(model: str) -> str:
    key = os.getenv(f"{model.upper()}_API_KEY")
    if not key:
        raise HTTPException(status_code=400, detail=f"API key for {model} not found")
    return key

@app.post("/generate")
async def generate_response(model: str = Form(...), prompt: str = Form(...)):
    try:
        api_key = get_api_key(model)
        
        # TODO: Implement actual model calls based on the selected model
        # This is a placeholder response
        return {
            "response": f"Response from {model} for prompt: {prompt}",
            "model": model
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    content = await file.read()
    
    try:
        if file.filename.endswith('.pdf'):
            # Handle PDF
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
        elif file.filename.endswith('.txt'):
            # Handle TXT
            text = content.decode('utf-8')
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")
        
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/store-keys")
async def store_api_keys(
    openai_key: Optional[str] = Form(None),
    gemini_key: Optional[str] = Form(None),
    claude_key: Optional[str] = Form(None),
    perplexity_key: Optional[str] = Form(None)
):
    try:
        env_path = os.path.join(os.path.dirname(__file__), '.env')
        
        # Update only provided keys
        if openai_key:
            set_key(env_path, "OPENAI_API_KEY", openai_key)
        if gemini_key:
            set_key(env_path, "GEMINI_API_KEY", gemini_key)
        if claude_key:
            set_key(env_path, "CLAUDE_API_KEY", claude_key)
        if perplexity_key:
            set_key(env_path, "PERPLEXITY_API_KEY", perplexity_key)
        
        return {"message": "API keys updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Welcome to AI Chat API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 
    
    