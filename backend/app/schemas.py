from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# USER SCHEMAS
class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# TASK SCHEMAS
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    amount: float = 0.0
    is_completed: bool = False

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: int
    plan_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# PLAN SCHEMAS
class PlanBase(BaseModel):
    title: str
    description: Optional[str] = None

class PlanCreate(PlanBase):
    pass

class Plan(PlanBase):
    id: int
    owner_id: int
    created_at: datetime
    tasks: List[Task] = []

    class Config:
        from_attributes = True

# AI SCHEMAS
class AIAdviceResponse(BaseModel):
    advice: str

class AIAudioResponse(BaseModel):
    title: str
    description: Optional[str] = None
    amount: float = 0.0
    action: str  # e.g., "create_plan" or "create_task"
