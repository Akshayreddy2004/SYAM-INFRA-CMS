from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, models, deps

router = APIRouter(prefix="/api/clients", tags=["clients"])

@router.get("/", response_model=List[schemas.Client])
def get_clients(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    return db.query(models.Client).filter(models.Client.is_deleted == False).order_by(models.Client.created_at.desc()).offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.Client)
def create_client(client: schemas.ClientCreate, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    count = db.query(models.Client).count()
    new_id = f"CLI-{count + 1:03d}"
    db_client = models.Client(**client.model_dump(), id=new_id)
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

@router.get("/{client_id}", response_model=schemas.Client)
def get_client(client_id: str, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    client = db.query(models.Client).filter(models.Client.id == client_id, models.Client.is_deleted == False).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.put("/{client_id}", response_model=schemas.Client)
def update_client(client_id: str, client: schemas.ClientUpdate, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    db_client = db.query(models.Client).filter(models.Client.id == client_id, models.Client.is_deleted == False).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    for key, value in client.model_dump(exclude_unset=True).items():
        setattr(db_client, key, value)
    db.commit()
    db.refresh(db_client)
    return db_client

@router.delete("/{client_id}")
def delete_client(client_id: str, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    db_client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    db_client.is_deleted = True
    db.commit()
    return {"message": "Client deleted successfully"}
