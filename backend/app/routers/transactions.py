from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from ..schemas import TransactionCreate, TransactionRead, TransactionUpdate
from ..models import Transaction
from ..dependencies import get_db, get_current_user
from ..categorize import import_transactions

router = APIRouter()

@router.post("/transactions/upload", response_model=Dict[str, int])
def upload_transactions(file: UploadFile = File(...), db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    contents = file.file.read()
    df = import_transactions(contents, file.filename)
    inserted = 0
    for _, row in df.iterrows():
        tr = Transaction(
            date=row["Date"],
            description=row["Description"],
            amount=row["Amount"],
            category=row["Category"],
            user_id=current_user.id,
            account_id=row.get("SourceID") or None
        )
        db.add(tr); inserted += 1
    db.commit()
    return {"inserted": inserted}

@router.get("/transactions", response_model=List[TransactionRead])
def list_transactions(start: str = None, end: str = None, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    q = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    # optional date filtering omitted for brevity
    return q.all()

@router.get("/transactions/{tx_id}", response_model=TransactionRead)
def get_transaction(tx_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    tr = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.user_id == current_user.id).first()
    if not tr:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tr

@router.put("/transactions/{tx_id}", response_model=TransactionRead)
def update_transaction(tx_id: int, data: TransactionUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    tr = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.user_id == current_user.id).first()
    if not tr:
        raise HTTPException(status_code=404, detail="Transaction not found")
    tr.category = data.category
    db.commit(); db.refresh(tr)
    return tr

@router.delete("/transactions/{tx_id}", response_model=dict)
def delete_transaction(tx_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    tr = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.user_id == current_user.id).first()
    if not tr:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(tr); db.commit()
    return {"msg": "deleted"}