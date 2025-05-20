from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..schemas import AccountCreate, AccountRead
from ..models import Account
from ..dependencies import get_db, get_current_user

router = APIRouter()

@router.get("/accounts", response_model=List[AccountRead])
def get_accounts(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Account).filter(Account.user_id == current_user.id).all()

@router.post("/accounts", response_model=AccountRead)
def create_account(account: AccountCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    acc = Account(name=account.name, user_id=current_user.id)
    db.add(acc); db.commit(); db.refresh(acc)
    return acc