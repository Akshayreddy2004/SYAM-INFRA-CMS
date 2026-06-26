from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, models, deps

router = APIRouter(prefix="/api/projects", tags=["projects"])

@router.get("/", response_model=List[schemas.Project])
def get_projects(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    return db.query(models.Project).filter(models.Project.is_deleted == False).order_by(models.Project.created_at.desc()).offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.Project)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    count = db.query(models.Project).count()
    new_id = f"PRJ-{count + 1:03d}"
    db_project = models.Project(**project.model_dump(), id=new_id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/{project_id}", response_model=schemas.Project)
def get_project(project_id: str, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.is_deleted == False).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.put("/{project_id}", response_model=schemas.Project)
def update_project(project_id: str, project: schemas.ProjectUpdate, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.is_deleted == False).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    for key, value in project.model_dump(exclude_unset=True).items():
        setattr(db_project, key, value)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.delete("/{project_id}")
def delete_project(project_id: str, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    db_project.is_deleted = True
    db.commit()
    return {"message": "Project deleted successfully"}
