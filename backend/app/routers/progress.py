from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from .. import schemas, models, deps

router = APIRouter(prefix="/api/progress", tags=["progress"])

@router.get("/project/{project_id}", response_model=List[schemas.ProjectProgress])
def get_progress_history(project_id: str, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    return db.query(models.ProjectProgress).filter(
        models.ProjectProgress.project_id == project_id
    ).order_by(models.ProjectProgress.update_date.desc()).all()

@router.post("/", response_model=schemas.ProjectProgress)
def add_progress_stage(progress: schemas.ProjectProgressCreate, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    # Verify project exists
    db_project = db.query(models.Project).filter(models.Project.id == progress.project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Calculate new percentage
    new_percentage = db_project.progress_percentage + progress.percentage_update
    if new_percentage > 100:
        new_percentage = 100
        
    db_project.progress_percentage = new_percentage
    
    # Auto-update status if 100%
    if new_percentage == 100:
        db_project.status = "Completed"

    # Create progress record
    db_progress = models.ProjectProgress(
        project_id=progress.project_id,
        stage_name=progress.stage_name,
        percentage_update=progress.percentage_update,
        notes=progress.notes,
        update_date=datetime.utcnow()
    )
    
    db.add(db_progress)
    db.commit()
    db.refresh(db_progress)
    
    return db_progress
