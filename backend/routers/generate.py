from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from backend.services.model_router import call_openai, call_gemini, call_claude, call_perplexity

# Load environment variables from .env file
load_dotenv()

router = APIRouter()

class GenerateRequest(BaseModel):
    """
    Request model for the generate endpoint.
    
    Attributes:
        model (str): The AI model to use (openai, gemini, claude, or perplexity)
        prompt (str): The input prompt to generate a response for
    """
    model: str
    prompt: str

@router.post("/generate")
async def generate(request: GenerateRequest):
    """
    Generate a response using the specified AI model.
    
    Args:
        request (GenerateRequest): The request containing model and prompt
        
    Returns:
        dict: Response containing generated text and estimated cost
        
    Raises:
        HTTPException: If API key is missing or model is invalid
    """
    model = request.model
    prompt = request.prompt

    # Estimate tokens based on prompt length (roughly 4 characters per token)
    estimated_tokens = len(prompt) // 4

    # Route to appropriate model based on selection
    if model == "openai":
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not found")
        response = call_openai(prompt, api_key)
        cost = estimated_tokens * 0.03 / 1000  # $0.03 per 1K tokens
    elif model == "gemini":
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="Gemini API key not found")
        response = call_gemini(prompt, api_key)
        cost = 0  # Cost not applicable for Gemini
    elif model == "claude":
        api_key = os.getenv("CLAUDE_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="Claude API key not found")
        response = call_claude(prompt, api_key)
        cost = estimated_tokens * 0.01 / 1000  # Estimated cost for Claude
    elif model == "perplexity":
        api_key = os.getenv("PERPLEXITY_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="Perplexity API key not found")
        response = call_perplexity(prompt, api_key)
        cost = 0  # Cost not applicable for Perplexity
    else:
        raise HTTPException(status_code=400, detail="Invalid model specified")

    return {"response": response, "cost": cost} 