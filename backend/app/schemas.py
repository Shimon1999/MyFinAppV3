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
    target_amount: float
    current_amount: float = 0.0
    color: Optional[str] = None
    icon: Optional[str] = None
    target_date: Optional[date] = None

class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    name: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    target_date: Optional[date] = None

# GoalFunds schema
class GoalFunds(BaseModel):
    amount: float

class GoalRead(GoalBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True

# Budget schemas
class BudgetBase(BaseModel):
    year: int
    month: int
    category: str
    amount: float

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    year: Optional[int] = None
    month: Optional[int] = None
    category: Optional[str] = None
    amount: Optional[float] = None

class BudgetRead(BudgetBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True

# Reporting schemas
class SummaryReport(BaseModel):
    totalByCategory: Dict[str, float]
    totalIncome: float
    totalExpense: float

class TrendsReport(BaseModel):
    trends: Dict[str, Dict[str, float]]