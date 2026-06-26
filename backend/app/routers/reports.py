from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import date
from .. import models, deps

router = APIRouter(prefix="/api/reports", tags=["reports"])

@router.get("/financial")
def get_financial_report(start_date: Optional[date] = None, end_date: Optional[date] = None, project_id: Optional[str] = None, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    expenses_query = db.query(models.Expense).filter(models.Expense.is_deleted == False)
    revenue_query = db.query(models.PaymentHistory)
    
    if project_id:
        expenses_query = expenses_query.filter(models.Expense.project_id == project_id)
        revenue_query = revenue_query.join(models.PaymentSchedule).filter(models.PaymentSchedule.project_id == project_id)
        
    if start_date:
        expenses_query = expenses_query.filter(models.Expense.date >= start_date)
        revenue_query = revenue_query.filter(models.PaymentHistory.payment_date >= start_date)
        
    if end_date:
        expenses_query = expenses_query.filter(models.Expense.date <= end_date)
        revenue_query = revenue_query.filter(models.PaymentHistory.payment_date <= end_date)
        
    total_expenses = expenses_query.with_entities(func.sum(models.Expense.amount)).scalar() or 0.0
    total_revenue = revenue_query.with_entities(func.sum(models.PaymentHistory.amount)).scalar() or 0.0
    
    return {
        "total_revenue": total_revenue,
        "total_expenses": total_expenses,
        "profit": total_revenue - total_expenses
    }
