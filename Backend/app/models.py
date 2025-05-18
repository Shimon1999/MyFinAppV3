from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .db import Base
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(128), nullable=False)
    transactions = relationship('Transaction', back_populates='user')

    @property
    def is_authenticated(self) -> bool:
        return True

    def verify_password(self, password: str) -> bool:
        return pwd_context.verify(password, self.password_hash)

    def set_password(self, password: str):
        self.password_hash = pwd_context.hash(password)

class Transaction(Base):
    __tablename__ = 'transactions'
    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=False)
    mcc = Column(String)
    amount = Column(Float, nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    currency = Column(String(10), default="AED")
    category = Column(String)
    orig_category = Column(String)
    user_id = Column(Integer, ForeignKey('users.id'))
    user = relationship('User', back_populates='transactions')

class Override(Base):
    __tablename__ = 'overrides'
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey('transactions.id'), nullable=False)
    new_category = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
