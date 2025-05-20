from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..schemas import BudgetCreate, BudgetRead, BudgetUpdate
from ..models import Budget
from ..dependencies import get_db, get_current_user

router = APIRouter()

@router.get("/budgets", response_model=List[BudgetRead])
def list_budgets(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Budget).filter(Budget.user_id == current_user.id).all()

@router.post("/budgets", response_model=BudgetRead)
def create_budget(data: BudgetCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    b = Budget(category=data.category, amount=data.amount, user_id=current_user.id)
    db.add(b); db.commit(); db.refresh(b)
    return b

@router.put("/budgets/{budget_id}", response_model=BudgetRead)
def update_budget(budget_id: int, data: BudgetUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    b = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Budget not found")
    b.amount = data.amount
    db.commit(); db.refresh(b)
    return b

@router.delete("/budgets/{budget_id}", response_model=dict)
def delete_budget(budget_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    b = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Budget not found")
    db.delete(b); db.commit()
    return {"msg": "deleted"}