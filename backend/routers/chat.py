from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/chat", tags=["chat"])

class Message(BaseModel):
    content: str
    role: str = "user"
    model: Optional[str] = None

class ChatResponse(BaseModel):
    message: str
    model: str

@router.post("/send", response_model=ChatResponse)
async def send_message(message: Message):
    try:
        # TODO: Implement actual AI model integration
        return ChatResponse(
            message=f"Echo: {message.content}",
            model=message.model or "default"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history", response_model=List[Message])
async def get_chat_history():
    # TODO: Implement chat history storage and retrieval
    return [] 