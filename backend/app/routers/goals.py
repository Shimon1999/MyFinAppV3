from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..schemas import GoalCreate, GoalRead, GoalUpdate, GoalFunds
from ..models import Goal
from ..dependencies import get_db, get_current_user

router = APIRouter(prefix="/goals", tags=["Goals"])

@router.get("", response_model=List[GoalRead])
def list_goals(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Goal).filter(Goal.user_id == current_user.id).all()

@router.get("/{goal_id}", response_model=GoalRead)
def get_goal(goal_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    g = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Goal not found")
    return g

@router.post("", response_model=GoalRead)
def create_goal(data: GoalCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    g = Goal(
        user_id=current_user.id,
        name=data.name,
        target_amount=data.target_amount,
        current_amount=data.current_amount or 0.0,
        color=data.color,
        icon=data.icon,
        target_date=data.target_date,
    )
    db.add(g); db.commit(); db.refresh(g)
    return g

@router.put("/{goal_id}/funds", response_model=GoalRead)
def add_funds(goal_id: int, data: GoalFunds, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    g = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Goal not found")
    g.current_amount += data.amount
    db.commit(); db.refresh(g)
    return g

@router.put("/{goal_id}", response_model=GoalRead)
def update_goal(goal_id: int, data: GoalUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    g = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Goal not found")
    update_data = data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(g, field, value)
    db.commit(); db.refresh(g)
    return g

@router.delete("/{goal_id}", response_model=dict)
def delete_goal(goal_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    g = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(g); db.commit()
    return {"msg": "deleted"}