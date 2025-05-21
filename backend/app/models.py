from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from .db import Base

class User(Base):
    __tablename__ = "users"
    id          = Column(Integer, primary_key=True, index=True)
    email       = Column(String, unique=True, index=True, nullable=False)
    hashed_pw   = Column(String, nullable=False)
    name        = Column(String, nullable=True)

    accounts        = relationship("Account", back_populates="user")
    transactions    = relationship("Transaction", back_populates="user")
    goals           = relationship("Goal", back_populates="user")
    budgets         = relationship("Budget", back_populates="user")

class Account(Base):
    __tablename__ = "accounts"
    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String, nullable=False)
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=False)

    user            = relationship("User", back_populates="accounts")
    transactions    = relationship("Transaction", back_populates="account")

class Transaction(Base):
    __tablename__ = "transactions"
    id              = Column(Integer, primary_key=True, index=True)
    date            = Column(Date, nullable=False)
    description     = Column(String, nullable=False)
    amount          = Column(Float, nullable=False)
    category        = Column(String, nullable=False, default="Other")
    original_cat    = Column(String, nullable=True)
    user_id         = Column(Integer, ForeignKey("users.id"), nullable=False)
    account_id      = Column(Integer, ForeignKey("accounts.id"), nullable=False)

    user            = relationship("User", back_populates="transactions")
    account         = relationship("Account", back_populates="transactions")

class CategoryOverride(Base):
    __tablename__ = "overrides"
    id          = Column(Integer, primary_key=True, index=True)
    keyword     = Column(String, unique=True, nullable=False)
    category    = Column(String, nullable=False)

class Goal(Base):
    __tablename__ = "goals"
    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name            = Column(String, nullable=False)
    target_amount   = Column(Float, nullable=False)
    current_amount  = Column(Float, default=0.0, nullable=False)
    color           = Column(String, nullable=True)
    icon            = Column(String, nullable=True)
    target_date     = Column(Date, nullable=True)

    user            = relationship("User", back_populates="goals")

class Budget(Base):
    __tablename__ = "budgets"
    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    year        = Column(Integer, nullable=False)
    month       = Column(Integer, nullable=False)
    category    = Column(String, nullable=False)
    amount      = Column(Float, nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "year", "month", "category", name="uix_budget_user_month_cat"),
    )

    user        = relationship("User", back_populates="budgets")