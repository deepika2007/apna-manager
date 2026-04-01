from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas
from app.database import get_db
from app.auth_utils import get_current_user

router = APIRouter()

@router.get("/plan/{plan_id}", response_model=List[schemas.Task])
def read_tasks(plan_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Verify plan belongs to user
    plan = db.query(models.Plan).filter(models.Plan.id == plan_id, models.Plan.owner_id == current_user.id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
        
    tasks = db.query(models.Task).filter(models.Task.plan_id == plan_id).offset(skip).limit(limit).all()
    return tasks

@router.post("/plan/{plan_id}", response_model=schemas.Task)
def create_task(plan_id: int, task: schemas.TaskCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    plan = db.query(models.Plan).filter(models.Plan.id == plan_id, models.Plan.owner_id == current_user.id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    db_task = models.Task(**task.model_dump(), plan_id=plan_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.put("/{task_id}", response_model=schemas.Task)
def update_task(task_id: int, task_update: schemas.TaskCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # We must ensure the task belongs to a plan owned by the current user
    task = db.query(models.Task).join(models.Plan).filter(
        models.Task.id == task_id, 
        models.Plan.owner_id == current_user.id
    ).first()
    
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.title = task_update.title
    task.description = task_update.description
    task.amount = task_update.amount
    task.is_completed = task_update.is_completed
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    task = db.query(models.Task).join(models.Plan).filter(
        models.Task.id == task_id, 
        models.Plan.owner_id == current_user.id
    ).first()
    
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}
