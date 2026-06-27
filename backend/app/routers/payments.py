from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from .. import schemas, models, deps

router = APIRouter(prefix="/api/payments", tags=["payments"])

@router.get("/project/{project_id}", response_model=List[schemas.PaymentSchedule])
def get_payment_schedules(project_id: str, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    return db.query(models.PaymentSchedule).options(joinedload(models.PaymentSchedule.history)).filter(
        models.PaymentSchedule.project_id == project_id, 
        models.PaymentSchedule.is_deleted == False
    ).order_by(models.PaymentSchedule.id.asc()).all()

@router.post("/", response_model=schemas.PaymentSchedule)
def create_payment_schedule(schedule: schemas.PaymentScheduleCreate, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    db_schedule = models.PaymentSchedule(**schedule.model_dump())
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

@router.put("/{schedule_id}", response_model=schemas.PaymentSchedule)
def update_payment_schedule(schedule_id: int, schedule: schemas.PaymentScheduleUpdate, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    db_schedule = db.query(models.PaymentSchedule).filter(models.PaymentSchedule.id == schedule_id, models.PaymentSchedule.is_deleted == False).first()
    if not db_schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    for key, value in schedule.model_dump(exclude_unset=True).items():
        setattr(db_schedule, key, value)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

@router.post("/{schedule_id}/collect", response_model=schemas.PaymentSchedule)
def collect_payment(schedule_id: int, payment: schemas.PaymentHistoryBase, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    db_schedule = db.query(models.PaymentSchedule).filter(models.PaymentSchedule.id == schedule_id, models.PaymentSchedule.is_deleted == False).first()
    if not db_schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
        
    history = models.PaymentHistory(
        schedule_id=schedule_id,
        amount=payment.amount,
        payment_date=payment.payment_date,
        notes=payment.notes
    )
    db.add(history)
    
    db_schedule.amount_received += payment.amount
    if db_schedule.amount_received >= db_schedule.expected_amount:
        db_schedule.status = "Paid"
    elif db_schedule.amount_received > 0:
        db_schedule.status = "Partial"
        
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

@router.delete("/history/{history_id}")
def delete_payment_history(history_id: int, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    history = db.query(models.PaymentHistory).filter(models.PaymentHistory.id == history_id).first()
    if not history:
        raise HTTPException(status_code=404, detail="Payment record not found")
        
    schedule = db.query(models.PaymentSchedule).filter(models.PaymentSchedule.id == history.schedule_id).first()
    if schedule:
        schedule.amount_received -= history.amount
        if schedule.amount_received <= 0:
            schedule.amount_received = 0
            schedule.status = "Pending"
        elif schedule.amount_received < schedule.expected_amount:
            schedule.status = "Partial"
            
    db.delete(history)
    db.commit()
    return {"status": "success"}

@router.delete("/{schedule_id}/legacy")
def delete_legacy_payment(schedule_id: int, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    schedule = db.query(models.PaymentSchedule).filter(models.PaymentSchedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    schedule.amount_received = 0
    schedule.status = "Pending"
    db.commit()
    return {"status": "success"}
