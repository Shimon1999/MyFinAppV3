from fastapi import APIRouter, Depends, Request, UploadFile, File, Form, Path as FPath
from pathlib import Path
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi.concurrency import run_in_threadpool
import json

from ..db import SessionLocal, engine, Base
from ..models import Transaction, Override, User
from ..categorize import import_transactions, CATEGORY_KEYWORDS
from .auth import get_current_user, get_db

router = APIRouter(tags=["transactions"])
templates = Jinja2Templates(directory="templates")

# ensure tables are created
Base.metadata.create_all(bind=engine)

# define a constant upload directory
UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"

@router.get("/")
async def home(request: Request, current_user: User | None = Depends(get_current_user)):
    if current_user is None:
        return RedirectResponse("/login", status_code=303)
    return templates.TemplateResponse(
        "upload.html",
        {
            "request": request,
            "current_user": current_user
        }
    )

@router.post("/upload")
async def upload(
    request: Request,
    file: UploadFile = File(...),
    current_user: User | None = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # enforce authentication
    if current_user is None:
        return RedirectResponse("/login", status_code=303)

    # sanitize filename and read raw bytes
    filename = Path(file.filename).name
    content = await file.read()

    # attempt to import & categorize from bytes + filename
    try:
        df = await run_in_threadpool(import_transactions, content, filename)
    except Exception as e:
        import traceback
        traceback.print_exc()  # logs full stacktrace
        return templates.TemplateResponse(
            "upload.html",
            {
                "request": request,
                "current_user": current_user,
                "error": f"Import failed: {e}"
            }
        )

    # persist the DataFrame rows into your DB
    for _, row in df.iterrows():
        tx = Transaction(
            description    = row["Description"],
            mcc            = row.get("MCC"),
            amount         = row["Amount"],
            date           = row["Date"],
            currency       = row.get("Currency", "AED"),
            category       = row["Category"],
            orig_category  = row["OrigCategory"],
            user_id        = current_user.id,
        )
        db.add(tx)
    db.commit()

    return RedirectResponse("/summary", status_code=303)

@router.get("/summary")
async def summary(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user),
):
    if current_user is None:
        return RedirectResponse("/login", status_code=303)

    data = (
        db.query(Transaction.category, func.sum(Transaction.amount))
        .filter(Transaction.user_id == current_user.id)
        .group_by(Transaction.category)
        .all()
    )
    return templates.TemplateResponse(
        "summary.html",
        {
            "request": request,
            "data": data,
            "currency": "AED",
            "current_user": current_user,
        },
    )

@router.get("/details/{cat}")
async def details(
    request: Request,
    cat: str = FPath(..., description="Category to display"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user is None:
        return RedirectResponse("/login", status_code=303)

    txs = (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id, Transaction.category == cat)
        .all()
    )
    return templates.TemplateResponse(
        "details.html",
        {
            "request": request,
            "transactions": txs,
            "category": cat,
            "categories": CATEGORY_KEYWORDS,
            "current_user": current_user,
        },
    )

@router.post("/override")
async def override(
    request: Request,
    tx_id: int = Form(...),
    new_cat: str = Form(...),
    db: Session = Depends(get_db),
):
    # we still assume a valid user cookie here
    o = Override(transaction_id=tx_id, new_category=new_cat)
    db.add(o)
    db.query(Transaction).filter(Transaction.id == tx_id).update({"category": new_cat})
    db.commit()

    # update overrides.json
    overrides = {}
    try:
        with open(Path.home() / "Documents" / "overrides.json") as f:
            overrides = json.load(f)
    except:
        pass
    tx = db.query(Transaction).get(tx_id)
    overrides[tx.description.lower()] = new_cat
    with open(Path.home() / "Documents" / "overrides.json", "w") as f:
        json.dump(overrides, f, indent=2)

    return JSONResponse({"status": "ok"})