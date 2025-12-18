from fastapi import FastAPI, Request, UploadFile, Depends, Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
import shutil
import os

from create_db import get_db
from schemas.user_schema import UserCreate, UserRead
from models.user_model import User


app = FastAPI()

templates = Jinja2Templates(directory="templates/html")
app.mount("/static", StaticFiles(directory="static"), name="static")
os.makedirs("uploaded_files", exist_ok=True)


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("home.html", {"request": request})

@app.get("/faq")
def faq(request: Request):
    return templates.TemplateResponse("faq.html", {"request": request})

@app.get("/login")
def login(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/register")
def register(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

@app.post("/upload")
async def upload_file(file: UploadFile):
    with open(f"uploaded_files/{file.filename}", "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": file.filename}


@app.post("/login", response_class=HTMLResponse)
async def login(
            email: str = Form(...), 
            password: str = Form(...),
            db: Session = Depends(get_db)
            ):
    user = db.query(User).filter(User.email == email and User.password == password).first()
    if user:
        return templates.TemplateResponse("home.html", {"request": Request})
    else:
        return HTMLResponse(content="User not found", status_code=404)


@app.post("/signup", response_model=UserCreate)
async def signup( user: UserCreate, db: Session = Depends(get_db)):
    new_user = User(**user.model_dump())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
