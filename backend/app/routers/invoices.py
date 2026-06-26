from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, models, deps
import datetime

router = APIRouter(prefix="/api/invoices", tags=["invoices"])

@router.get("/", response_model=List[schemas.Invoice])
def get_all_invoices(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    return db.query(models.Invoice).filter(models.Invoice.is_deleted == False).order_by(models.Invoice.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/project/{project_id}", response_model=List[schemas.Invoice])
def get_project_invoices(project_id: str, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    return db.query(models.Invoice).filter(models.Invoice.project_id == project_id, models.Invoice.is_deleted == False).order_by(models.Invoice.created_at.desc()).all()

@router.post("/", response_model=schemas.Invoice)
def create_invoice(invoice: schemas.InvoiceCreate, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    # Verify project exists
    project = db.query(models.Project).filter(models.Project.id == invoice.project_id, models.Project.is_deleted == False).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    count = db.query(models.Invoice).count()
    new_id = f"INV-{datetime.datetime.now().year}-{count + 1:04d}"
    
    db_invoice = models.Invoice(**invoice.model_dump(), id=new_id)
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

@router.get("/{invoice_id}", response_model=schemas.Invoice)
def get_invoice(invoice_id: str, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id, models.Invoice.is_deleted == False).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice

@router.put("/{invoice_id}", response_model=schemas.Invoice)
def update_invoice(invoice_id: str, invoice: schemas.InvoiceUpdate, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    db_invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id, models.Invoice.is_deleted == False).first()
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    for key, value in invoice.model_dump(exclude_unset=True).items():
        setattr(db_invoice, key, value)
        
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

@router.delete("/{invoice_id}")
def delete_invoice(invoice_id: str, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    db_invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    db_invoice.is_deleted = True
    db.commit()
    return {"message": "Invoice deleted successfully"}
