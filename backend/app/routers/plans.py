from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas
from app.database import get_db
from app.auth_utils import get_current_user

router = APIRouter()

@router.get("/", response_model=List[schemas.Plan])
def read_plans(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    plans = db.query(models.Plan).filter(models.Plan.owner_id == current_user.id).offset(skip).limit(limit).all()
    return plans

@router.post("/", response_model=schemas.Plan)
def create_plan(plan: schemas.PlanCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_plan = models.Plan(**plan.model_dump(), owner_id=current_user.id)
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.get("/{plan_id}", response_model=schemas.Plan)
def read_plan(plan_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    plan = db.query(models.Plan).filter(models.Plan.id == plan_id, models.Plan.owner_id == current_user.id).first()
    if plan is None:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan

@router.put("/{plan_id}", response_model=schemas.Plan)
def update_plan(plan_id: int, plan_update: schemas.PlanCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    plan = db.query(models.Plan).filter(models.Plan.id == plan_id, models.Plan.owner_id == current_user.id).first()
    if plan is None:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    plan.title = plan_update.title
    plan.description = plan_update.description
    db.commit()
    db.refresh(plan)
    return plan

@router.delete("/{plan_id}")
def delete_plan(plan_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    plan = db.query(models.Plan).filter(models.Plan.id == plan_id, models.Plan.owner_id == current_user.id).first()
    if plan is None:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    db.delete(plan)
    db.commit()
    return {"message": "Plan deleted successfully"}
