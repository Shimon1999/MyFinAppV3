from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..schemas import GoalCreate, GoalRead, GoalFunds
from ..models import Goal
from ..dependencies import get_db, get_current_user

router = APIRouter()

@router.get("/goals", response_model=List[GoalRead])
def list_goals(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Goal).filter(Goal.user_id == current_user.id).all()

@router.post("/goals", response_model=GoalRead)
def create_goal(data: GoalCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    g = Goal(name=data.name, target=data.target, user_id=current_user.id)
    db.add(g); db.commit(); db.refresh(g)
    return g

@router.put("/goals/{goal_id}/funds", response_model=GoalRead)
def add_funds(goal_id: int, data: GoalFunds, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    g = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Goal not found")
    g.saved += data.amount
    db.commit(); db.refresh(g)
    return g

@router.delete("/goals/{goal_id}", response_model=dict)
def delete_goal(goal_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    g = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(g); db.commit()
    return {"msg": "deleted"}