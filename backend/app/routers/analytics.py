from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any

from app import models
from app.database import get_db
from app.auth_utils import get_current_user

router = APIRouter()

@router.get("/summary", response_model=Dict[str, Any])
def get_analytics_summary(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """
    Returns aggregated data for the dashboard.
    e.g., total expenses, total plans, total completed tasks.
    """
    # Count of plans
    total_plans = db.query(models.Plan).filter(models.Plan.owner_id == current_user.id).count()
    
    # Base query for tasks belonging to user
    user_tasks_query = db.query(models.Task).join(models.Plan).filter(models.Plan.owner_id == current_user.id)
    
    # Total expenses
    total_expenses = user_tasks_query.with_entities(func.sum(models.Task.amount)).scalar() or 0.0
    
    # Completed tasks count
    total_completed = user_tasks_query.filter(models.Task.is_completed == True).count()
    
    # All tasks count
    total_tasks = user_tasks_query.count()

    # Expenses aggregated by plan (for charts)
    plan_expenses = db.query(
        models.Plan.title, 
        func.sum(models.Task.amount).label("total")
    ).outerjoin(models.Task).filter(
        models.Plan.owner_id == current_user.id
    ).group_by(models.Plan.id).all()

    plan_expense_data = [{"plan": title, "amount": total or 0.0} for title, total in plan_expenses]

    return {
        "total_plans": total_plans,
        "total_tasks": total_tasks,
        "completed_tasks": total_completed,
        "total_expenses": total_expenses,
        "expenses_by_plan": plan_expense_data
    }
