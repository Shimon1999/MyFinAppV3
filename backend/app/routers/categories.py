from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..schemas import CategoryOverrideCreate, CategoryOverrideRead
from ..models import CategoryOverride, Transaction
from ..dependencies import get_db, get_current_user

router = APIRouter()

@router.get("/overrides", response_model=List[CategoryOverrideRead])
def get_overrides(db: Session = Depends(get_db)):
    return db.query(CategoryOverride).all()

@router.post("/overrides", response_model=CategoryOverrideRead)
def create_override(data: CategoryOverrideCreate, db: Session = Depends(get_db)):
    ov = CategoryOverride(keyword=data.keyword, category=data.category)
    db.add(ov); db.commit(); db.refresh(ov)
    return ov

@router.put("/overrides/{ov_id}", response_model=CategoryOverrideRead)
def update_override(ov_id: int, data: CategoryOverrideCreate, db: Session = Depends(get_db)):
    ov = db.query(CategoryOverride).filter(CategoryOverride.id == ov_id).first()
    ov.category = data.category
    db.commit(); db.refresh(ov)
    return ov

@router.delete("/overrides/{ov_id}", response_model=dict)
def delete_override(ov_id: int, db: Session = Depends(get_db)):
    ov = db.query(CategoryOverride).filter(CategoryOverride.id == ov_id).first()
    db.delete(ov); db.commit()
    return {"msg": "deleted"}

@router.get("/categories", response_model=List[CategoryOverrideRead])
def list_categories(db: Session = Depends(get_db)):
    return db.query(CategoryOverride).all()

@router.get("/categories/{category_name}/transactions", response_model=List[TransactionRead])
def category_transactions(category_name: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id, Transaction.category == category_name)
        .all()
    )