from fastapi import APIRouter, Depends, Request, Form, status
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from ..db import SessionLocal
from ..models import User

router = APIRouter(tags=["auth"])
templates = Jinja2Templates(directory="templates")

# dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(request: Request, db: Session = Depends(get_db)) -> User | None:
    user_id = request.cookies.get('user')
    if not user_id:
        return None
    return db.query(User).filter(User.id == int(user_id)).first()

@router.get('/register')
async def register_form(request: Request, current_user: User | None = Depends(get_current_user)):
    return templates.TemplateResponse('register.html', {"request": request, "current_user": current_user})

@router.post("/register")
async def register(request: Request, username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    if db.query(User).filter_by(username=username).first():
        return templates.TemplateResponse(
          "register.html",
          {
            "request": request,
            "error": "That username is already taken.",
            "current_user": None
          }
        )
    user = User(username=username)
    user.set_password(password)
    db.add(user)
    db.commit()
    return RedirectResponse("/login", status_code=status.HTTP_303_SEE_OTHER)

@router.get('/login')
async def login_form(request: Request, current_user: User | None = Depends(get_current_user)):
    return templates.TemplateResponse('login.html', {"request": request, "current_user": current_user})

@router.post('/login')
async def login(request: Request, username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user or not user.verify_password(password):
        return templates.TemplateResponse('login.html', {"request": request, "error": "Invalid credentials", "current_user": None})
    response = RedirectResponse('/', status_code=status.HTTP_303_SEE_OTHER)
    response.set_cookie(key="user", value=str(user.id))
    return response

@router.get('/logout')
async def logout():
    response = RedirectResponse('/login', status_code=status.HTTP_303_SEE_OTHER)
    response.delete_cookie(key="user")
    return response
