# backend/app/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from datetime import date

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int

    class Config:
        orm_mode = True

# Authentication token schema
class Token(BaseModel):
    token: str

# Account schemas
class AccountBase(BaseModel):
    name: str

class AccountCreate(AccountBase):
    pass

class AccountRead(AccountBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True

# Transaction schemas
class TransactionBase(BaseModel):
    date: date
    description: str
    amount: float
    category: Optional[str] = None

class TransactionCreate(TransactionBase):
    account_id: Optional[int] = None

class TransactionUpdate(BaseModel):
    category: str

class TransactionRead(TransactionBase):
    id: int
    user_id: int
    account_id: Optional[int] = None

    class Config:
        orm_mode = True

# Category override schemas
class CategoryOverrideBase(BaseModel):
    keyword: str
    category: str

class CategoryOverrideCreate(CategoryOverrideBase):
    pass

class CategoryOverrideRead(CategoryOverrideBase):
    id: int

    class Config:
        orm_mode = True

# Goal schemas
class GoalBase(BaseModel):
    name: str
    target: float

class GoalCreate(GoalBase):
    pass

class GoalRead(GoalBase):
    id: int
    saved: float
    user_id: int

    class Config:
        orm_mode = True

class GoalFunds(BaseModel):
    amount: float

# Budget schemas
class BudgetBase(BaseModel):
    category: str
    amount: float

class BudgetCreate(BudgetBase):
    pass

class BudgetRead(BudgetBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True

class BudgetUpdate(BaseModel):
    amount: float

# Reporting schemas
class SummaryReport(BaseModel):
    totalByCategory: Dict[str, float]
    totalIncome: float
    totalExpense: float

class TrendsReport(BaseModel):
    trends: Dict[str, Dict[str, float]]
