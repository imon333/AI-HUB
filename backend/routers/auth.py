from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv, set_key
import os

router = APIRouter()

class APIKeys(BaseModel):
    """
    Request model for storing API keys.
    
    Attributes:
        openai_api_key (str): OpenAI API key
        gemini_api_key (str): Google Gemini API key
        claude_api_key (str): Anthropic Claude API key
        perplexity_api_key (str): Perplexity API key
    """
    openai_api_key: str
    gemini_api_key: str
    claude_api_key: str
    perplexity_api_key: str

@router.post("/store-keys")
async def store_keys(keys: APIKeys):
    """
    Store API keys in the .env file.
    Note: This endpoint is only available in development mode.
    
    Args:
        keys (APIKeys): The API keys to store
        
    Returns:
        dict: Success message
        
    Raises:
        HTTPException: If in production mode or if there's an error storing the keys
    """
    # Get path to .env file
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
    
    # Prevent storing keys in production
    if os.getenv('ENVIRONMENT') == 'production':
        raise HTTPException(status_code=403, detail="Storing keys to disk is not allowed in production.")

    try:
        # Store each API key in the .env file
        set_key(env_path, 'OPENAI_API_KEY', keys.openai_api_key)
        set_key(env_path, 'GEMINI_API_KEY', keys.gemini_api_key)
        set_key(env_path, 'CLAUDE_API_KEY', keys.claude_api_key)
        set_key(env_path, 'PERPLEXITY_API_KEY', keys.perplexity_api_key)
        return {"message": "API keys stored successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error storing API keys: {str(e)}") 