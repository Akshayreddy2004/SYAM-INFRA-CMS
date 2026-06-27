from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from . import models, auth
from .routers import auth as auth_router, projects, dashboard, payments, expenses, documents, reports, progress, users, invoices, materials

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SYAM INFRA Management System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(dashboard.router)
app.include_router(projects.router)
app.include_router(payments.router)
app.include_router(expenses.router)
app.include_router(documents.router)
app.include_router(reports.router)
app.include_router(progress.router)
app.include_router(users.router)
app.include_router(invoices.router)
app.include_router(materials.router)
@app.on_event("startup")
def create_admin_user():
    db = SessionLocal()
    admin = db.query(models.User).filter(models.User.username == "admin").first()
    if not admin:
        hashed_password = auth.get_password_hash("admin123")
        new_admin = models.User(username="admin", hashed_password=hashed_password)
        db.add(new_admin)
        db.commit()
    db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to SYAM INFRA API"}
