from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from .routers import auth, transactions
from .db import engine, Base
import os
import pathlib

BASE_DIR = pathlib.Path(__file__).resolve().parent.parent
(BASE_DIR / "uploads").mkdir(exist_ok=True)
(BASE_DIR / "static").mkdir(exist_ok=True)

app = FastAPI()
Base.metadata.create_all(bind=engine)

app.mount(
    "/static",
    StaticFiles(directory=str(BASE_DIR / "static")),
    name="static"
)

app.include_router(auth.router)
app.include_router(transactions.router)
