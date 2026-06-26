from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
from .. import schemas, models, deps

router = APIRouter(prefix="/api/expenses", tags=["expenses"])

UPLOAD_DIR = "uploads/expenses"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/project/{project_id}", response_model=List[schemas.Expense])
def get_expenses(project_id: str, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    return db.query(models.Expense).filter(
        models.Expense.project_id == project_id, 
        models.Expense.is_deleted == False
    ).order_by(models.Expense.date.desc()).all()

@router.post("/", response_model=schemas.Expense)
def create_expense(expense: schemas.ExpenseCreate, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    db_expense = models.Expense(**expense.model_dump())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

@router.post("/{expense_id}/upload")
async def upload_bill(expense_id: int, file: UploadFile = File(...), db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    db_expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
        
    ext = file.filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    with open(filepath, "wb") as f:
        f.write(await file.read())
        
    db_expense.bill_file_path = filepath
    db.commit()
    db.refresh(db_expense)
    return {"message": "Bill uploaded successfully", "filepath": filepath}
