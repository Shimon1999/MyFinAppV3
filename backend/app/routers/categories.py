# backend/app/routers/categories.py

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..models import CategoryOverride, Transaction
from ..schemas import (
    CategoryOverrideRead,
    CategoryOverrideBase,
    TransactionRead
)
from ..dependencies import get_db, get_current_user

router = APIRouter(prefix="/categories", tags=["Categories"])

# --- Overrides existing endpoints ---
@router.get("/overrides", response_model=List[CategoryOverrideRead])
def get_overrides(db: Session = Depends(get_db)):
    return db.query(CategoryOverride).all()

@router.post("/overrides", response_model=CategoryOverrideRead)
def create_override(data: CategoryOverrideBase, db: Session = Depends(get_db)):
    ov = CategoryOverride(keyword=data.keyword, category=data.category)
    db.add(ov)
    db.commit()
    db.refresh(ov)
    return ov

@router.put("/overrides/{ov_id}", response_model=CategoryOverrideRead)
def update_override(ov_id: int, data: CategoryOverrideBase, db: Session = Depends(get_db)):
    ov = db.query(CategoryOverride).filter(CategoryOverride.id == ov_id).first()
    if not ov:
        raise HTTPException(status_code=404, detail="Override not found")
    ov.keyword = data.keyword
    ov.category = data.category
    db.commit()
    db.refresh(ov)
    return ov

@router.delete("/overrides/{ov_id}", status_code=204)
def delete_override(ov_id: int, db: Session = Depends(get_db)):
    ov = db.query(CategoryOverride).filter(CategoryOverride.id == ov_id).first()
    if not ov:
        raise HTTPException(status_code=404, detail="Override not found")
    db.delete(ov)
    db.commit()
    return

# --- List all categories (names only) ---
@router.get("/", response_model=List[str])
def list_categories(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Example: return distinct category names from this user's transactions
    cats = (
        db.query(Transaction.category)
          .filter(Transaction.user_id == current_user.id)
          .distinct()
          .all()
    )
    return [c[0] for c in cats]

# --- New: Get all transactions for a given category ---
@router.get("/{category_name}/transactions", response_model=List[TransactionRead])
def get_transactions_by_category(
    category_name: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    txs = (
        db.query(Transaction)
          .filter(
              Transaction.user_id   == current_user.id,
              Transaction.category  == category_name
          )
          .all()
    )
    return txs