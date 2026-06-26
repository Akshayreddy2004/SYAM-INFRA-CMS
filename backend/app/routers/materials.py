from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, deps

router = APIRouter(
    prefix="/api/projects/{project_id}/materials",
    tags=["Materials"]
)

@router.get("/", response_model=List[schemas.ProjectMaterial])
def get_materials(project_id: str, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    # Check if project exists
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.is_deleted == False).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    materials = db.query(models.ProjectMaterial).filter(
        models.ProjectMaterial.project_id == project_id,
        models.ProjectMaterial.is_deleted == False
    ).all()
    return materials

@router.post("/", response_model=schemas.ProjectMaterial)
def create_material(project_id: str, material: schemas.ProjectMaterialBase, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.is_deleted == False).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    new_material = models.ProjectMaterial(
        project_id=project_id,
        name=material.name,
        total_quantity=material.total_quantity,
        used_quantity=material.used_quantity,
        unit=material.unit
    )
    db.add(new_material)
    db.commit()
    db.refresh(new_material)
    return new_material

@router.put("/{material_id}", response_model=schemas.ProjectMaterial)
def update_material(project_id: str, material_id: int, material_update: schemas.ProjectMaterialUpdate, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    material = db.query(models.ProjectMaterial).filter(
        models.ProjectMaterial.id == material_id,
        models.ProjectMaterial.project_id == project_id,
        models.ProjectMaterial.is_deleted == False
    ).first()
    
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
        
    if material_update.name is not None:
        material.name = material_update.name
    if material_update.total_quantity is not None:
        material.total_quantity = material_update.total_quantity
    if material_update.used_quantity is not None:
        material.used_quantity = material_update.used_quantity
    if material_update.unit is not None:
        material.unit = material_update.unit
        
    db.commit()
    db.refresh(material)
    return material

@router.delete("/{material_id}")
def delete_material(project_id: str, material_id: int, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):

    material = db.query(models.ProjectMaterial).filter(
        models.ProjectMaterial.id == material_id,
        models.ProjectMaterial.project_id == project_id,
        models.ProjectMaterial.is_deleted == False
    ).first()
    
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
        
    material.is_deleted = True
    db.commit()
    return {"message": "Material deleted successfully"}
