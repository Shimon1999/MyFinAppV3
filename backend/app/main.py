from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import engine, Base
from .routers import (
    auth,
    accounts,
    transactions,
    categories,
    goals,
    analysis,
    budgets,
)

# Create all database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(title="MyFinAppV3 API")

# CORS configuration (adjust origins when you deploy)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],    # e.g., ["http://localhost:3000"]
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# Mount API routers under /api
app.include_router(auth.router,         prefix="/api", tags=["Authentication"])
app.include_router(accounts.router,     prefix="/api", tags=["Accounts"])
app.include_router(transactions.router, prefix="/api", tags=["Transactions"])
app.include_router(categories.router,   prefix="/api", tags=["Categories"])
app.include_router(goals.router,        prefix="/api", tags=["Goals"])
app.include_router(analysis.router,     prefix="/api", tags=["Reports"])
app.include_router(budgets.router,      prefix="/api", tags=["Budgets"])