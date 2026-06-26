from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
from .. import schemas, models, deps

router = APIRouter(prefix="/api/documents", tags=["documents"])

UPLOAD_DIR = "uploads/documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/project/{project_id}", response_model=List[schemas.Document])
def get_documents(project_id: str, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    return db.query(models.Document).filter(
        models.Document.project_id == project_id, 
        models.Document.is_deleted == False
    ).order_by(models.Document.upload_date.desc()).all()

@router.post("/project/{project_id}")
async def upload_document(
    project_id: str, 
    name: str = Form(...), 
    type: str = Form(...), 
    file: UploadFile = File(...), 
    db: Session = Depends(deps.get_db), 
    current_user: models.User = Depends(deps.get_current_user)
):
    ext = file.filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    project_dir = os.path.join(UPLOAD_DIR, project_id)
    os.makedirs(project_dir, exist_ok=True)
    filepath = os.path.join(project_dir, filename)
    
    with open(filepath, "wb") as f:
        f.write(await file.read())
        
    db_doc = models.Document(
        project_id=project_id,
        name=name,
        type=type,
        file_path=filepath
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return db_doc

@router.get("/download/{doc_id}")
def download_document(doc_id: int, db: Session = Depends(deps.get_db)):
    doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not doc or not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="Document not found")
    # For a real app, this endpoint might need to be unprotected if directly clicked in browser, or protected via temporary token
    # keeping it unprotected for simplicity in this implementation
    return FileResponse(path=doc.file_path, filename=f"{doc.name}.{doc.file_path.split('.')[-1]}")
