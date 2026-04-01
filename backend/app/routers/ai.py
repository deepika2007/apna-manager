import os
import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from openai import OpenAI

from app import models, schemas
from app.database import get_db
from app.auth_utils import get_current_user

router = APIRouter()

# Initialize OpenAI client if key is present
openai_api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=openai_api_key) if openai_api_key else None

class AIAdviceRequest(BaseModel):
    task_id: int

@router.post("/parse-audio", response_model=schemas.AIAudioResponse)
async def parse_audio(
    audio: UploadFile = File(...), 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    """
    Accepts an audio file and uses OpenAI Whisper model to transcribe it.
    Then uses GPT-4o-mini to extract Task details (Title, Description, Amount) from the transcription.
    """
    if not client:
        # Mock Response if no API key
        return schemas.AIAudioResponse(
            title=f"Mock Task from Audio ({audio.filename})",
            description="Since no OPENAI_API_KEY is found, this is a mock.",
            amount=50.0,
            action="create_task"
        )
    
    try:
        # Save audio temporarily
        temp_path = f"/tmp/{audio.filename}"
        with open(temp_path, "wb") as buffer:
            buffer.write(await audio.read())
        
        # Transcribe
        with open(temp_path, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                model="whisper-1", 
                file=audio_file,
                response_format="text"
            )
            
        # Clean up
        import os
        os.remove(temp_path)

        system_prompt = """
        You are an AI assistant for an Expense & Todo Manager application. 
        Extract the task/expense details from the given text transcription.
        Respond ONLY in a valid JSON format with the following keys:
        - "title" (string)
        - "description" (string or null)
        - "amount" (float, default to 0.0 if not mentioned)
        - "action" (string: either "create_plan" or "create_task")
        """

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": transcription}
            ],
            response_format={"type": "json_object"}
        )
        
        result_str = response.choices[0].message.content
        result_json = json.loads(result_str)
        
        return schemas.AIAudioResponse(
            title=result_json.get("title", "Unknown Task"),
            description=result_json.get("description"),
            amount=float(result_json.get("amount", 0.0)),
            action=result_json.get("action", "create_task")
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ask-advice", response_model=schemas.AIAdviceResponse)
def ask_advice(
    request: AIAdviceRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Takes a specific expense/task and asks AI how to reduce this expense.
    """
    task = db.query(models.Task).join(models.Plan).filter(
        models.Task.id == request.task_id,
        models.Plan.owner_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    if not client:
        return {"advice": "This is a mock advice. To get real AI insights, please configure OPENAI_API_KEY in the environment. Try saving money by looking for alternatives!"}

    try:
        prompt = f"I have an expense item titled '{task.title}' with an amount of ${task.amount}. Description: '{task.description or 'None'}'. Can you give me 3 practical tips on how I can reduce this expense or manage it better?"
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful financial advisor API."},
                {"role": "user", "content": prompt}
            ]
        )
        
        return {"advice": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

