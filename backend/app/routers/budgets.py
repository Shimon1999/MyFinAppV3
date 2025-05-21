from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..schemas import BudgetCreate, BudgetRead, BudgetUpdate
from ..models import Budget
from ..dependencies import get_db, get_current_user

router = APIRouter(prefix="/budgets", tags=["Budgets"])

@router.get("/", response_model=List[BudgetRead])
def list_budgets(
    year: Optional[int] = None,
    month: Optional[int] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Budget).filter(Budget.user_id == current_user.id)
    if year is not None:
        query = query.filter(Budget.year == year)
    if month is not None:
        query = query.filter(Budget.month == month)
    if category:
        query = query.filter(Budget.category == category)
    return query.all()

@router.post("/", response_model=BudgetRead)
def create_budget(
    data: BudgetCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    b = Budget(user_id=current_user.id, **data.dict())
    db.add(b); db.commit(); db.refresh(b)
    return b

@router.put("/{budget_id}", response_model=BudgetRead)
def update_budget(
    budget_id: int,
    data: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    b = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Budget not found")
    update_data = data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(b, field, value)
    db.commit(); db.refresh(b)
    return b

@router.delete("/{budget_id}", response_model=dict)
def delete_budget(budget_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    b = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Budget not found")
    db.delete(b); db.commit()
    return {"msg": "deleted"}