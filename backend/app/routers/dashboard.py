from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models, deps

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):

    active_projects = db.query(models.Project).filter(models.Project.is_deleted == False, models.Project.status == "Ongoing").count()
    completed_projects = db.query(models.Project).filter(models.Project.is_deleted == False, models.Project.status == "Completed").count()
    
    total_revenue_query = db.query(func.sum(models.PaymentSchedule.amount_received)).filter(models.PaymentSchedule.is_deleted == False).scalar()
    total_revenue = total_revenue_query if total_revenue_query else 0.0
    
    total_expenses_query = db.query(func.sum(models.Expense.amount)).filter(models.Expense.is_deleted == False).scalar()
    total_expenses = total_expenses_query if total_expenses_query else 0.0
    
    expected_revenue_query = db.query(func.sum(models.PaymentSchedule.expected_amount)).filter(models.PaymentSchedule.is_deleted == False).scalar()
    expected_revenue = expected_revenue_query if expected_revenue_query else 0.0
    pending_payments = expected_revenue - total_revenue
    if pending_payments < 0:
        pending_payments = 0.0
        
    recent_projects = db.query(models.Project).filter(models.Project.is_deleted == False).order_by(models.Project.created_at.desc()).limit(5).all()
    
    # Needs to serialize recent_projects
    recent_projects_data = []
    for p in recent_projects:
        recent_projects_data.append({
            "id": p.id,
            "name": p.name,
            "status": p.status,
            "progress_percentage": p.progress_percentage
        })
        
    # Chart Data: Group Revenue and Expenses by Month for the last 6 months
    from collections import defaultdict
    import datetime
    
    monthly_data = defaultdict(lambda: {"name": "", "revenue": 0, "expenses": 0})
    
    # Get last 6 months keys (e.g., "Jan", "Feb")
    today = datetime.date.today()
    for i in range(5, -1, -1):
        d = today - datetime.timedelta(days=30*i)
        key = d.strftime("%Y-%m")
        name = d.strftime("%b")
        monthly_data[key]["name"] = name
        monthly_data[key]["revenue"] = 0
        monthly_data[key]["expenses"] = 0

    all_payments = db.query(models.PaymentSchedule).filter(models.PaymentSchedule.is_deleted == False, models.PaymentSchedule.status != "Pending").all()
    for p in all_payments:
        if p.due_date:
            key = p.due_date.strftime("%Y-%m")
            if key in monthly_data:
                monthly_data[key]["revenue"] += p.amount_received

    all_expenses = db.query(models.Expense).filter(models.Expense.is_deleted == False).all()
    for e in all_expenses:
        if e.date:
            key = e.date.strftime("%Y-%m")
            if key in monthly_data:
                monthly_data[key]["expenses"] += e.amount

    chart_data = [v for k, v in sorted(monthly_data.items())]
    
    return {
        "active_projects": active_projects,
        "completed_projects": completed_projects,
        "total_revenue": total_revenue,
        "total_expenses": total_expenses,
        "pending_payments": pending_payments,
        "recent_projects": recent_projects_data,
        "chart_data": chart_data
    }
