from typing import Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import datetime

from ..schemas import SummaryReport, TrendsReport
from ..models import Transaction
from ..dependencies import get_db, get_current_user

router = APIRouter()

@router.get("/reports/summary", response_model=SummaryReport)
def get_summary(month: str = None, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    q = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    if month:
        year, mon = map(int, month.split("-"))
        start = datetime.date(year, mon, 1)
        end = datetime.date(year + 1, 1, 1) if mon == 12 else datetime.date(year, mon + 1, 1)
        q = q.filter(Transaction.date >= start, Transaction.date < end)

    txs = q.all()
    total_by_cat: Dict[str, float] = {}
    total_income = 0.0
    total_expense = 0.0

    for t in txs:
        total_by_cat.setdefault(t.category, 0.0)
        total_by_cat[t.category] += t.amount
        if t.amount >= 0:
            total_income += t.amount
        else:
            total_expense += abs(t.amount)

    return {
        "totalByCategory": total_by_cat,
        "totalIncome": total_income,
        "totalExpense": total_expense
    }

@router.get("/reports/trends", response_model=TrendsReport)
def get_trends(start: str = None, end: str = None, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    q = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    if start:
        q = q.filter(Transaction.date >= datetime.date.fromisoformat(start))
    if end:
        q = q.filter(Transaction.date <= datetime.date.fromisoformat(end))

    txs = q.all()
    trends: Dict[str, Dict[str, float]] = {}

    for t in txs:
        key = t.date.strftime("%Y-%m")
        entry = trends.setdefault(key, {"income": 0.0, "expense": 0.0})
        if t.amount >= 0:
            entry["income"] += t.amount
        else:
            entry["expense"] += abs(t.amount)

    return {"trends": dict(sorted(trends.items()))}