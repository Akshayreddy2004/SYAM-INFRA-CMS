from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, models, deps, auth

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/me", response_model=schemas.User)
def get_current_user_profile(current_user: models.User = Depends(deps.get_current_user)):
    return current_user

@router.put("/me/password")
def update_password(payload: schemas.UserPasswordUpdate, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    if not auth.verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    current_user.hashed_password = auth.get_password_hash(payload.new_password)
    db.commit()
    return {"message": "Password updated successfully"}

@router.put("/me/avatar", response_model=schemas.User)
def update_avatar(payload: schemas.UserAvatarUpdate, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    current_user.avatar = payload.avatar
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/", response_model=List[schemas.User])
def get_users(db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized to view users")
    return db.query(models.User).all()

@router.post("/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized to create users")
    
    existing = db.query(models.User).filter(models.User.username == user.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already registered")
        
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(username=user.username, hashed_password=hashed_password, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete users")
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}
