from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserBase(BaseModel):
    username: str
    role: Optional[str] = "Viewer"
    avatar: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str

class UserAvatarUpdate(BaseModel):
    avatar: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True


# --- Project ---
class ProjectBase(BaseModel):
    name: str
    client_name: str
    client_phone: str
    location: Optional[str] = None
    value: float
    start_date: Optional[date] = None
    expected_completion: Optional[date] = None
    status: Optional[str] = "Ongoing"
    project_type: Optional[str] = "Cement + Interiors"

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(ProjectBase):
    progress_percentage: Optional[int] = None

class Project(ProjectBase):
    id: str
    progress_percentage: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Payment History ---
class PaymentHistoryBase(BaseModel):
    amount: float
    payment_date: date
    notes: Optional[str] = None

class PaymentHistoryCreate(PaymentHistoryBase):
    schedule_id: int

class PaymentHistory(PaymentHistoryBase):
    id: int
    schedule_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Payment Schedules ---
class PaymentScheduleBase(BaseModel):
    stage_name: str
    expected_amount: float
    due_date: Optional[date] = None

class PaymentScheduleCreate(PaymentScheduleBase):
    project_id: str

class PaymentScheduleUpdate(BaseModel):
    stage_name: Optional[str] = None
    expected_amount: Optional[float] = None
    due_date: Optional[date] = None

class PaymentSchedule(PaymentScheduleBase):
    id: int
    project_id: str
    amount_received: float
    status: str
    created_at: datetime
    updated_at: datetime
    history: List[PaymentHistory] = []

    class Config:
        from_attributes = True

# --- Expense ---
class ExpenseBase(BaseModel):
    date: date
    category: str
    amount: float
    description: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    project_id: str

class ExpenseUpdate(ExpenseBase):
    pass

class Expense(ExpenseBase):
    id: int
    project_id: str
    bill_file_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Document ---
class DocumentBase(BaseModel):
    name: str
    type: str

class DocumentCreate(DocumentBase):
    project_id: str

class Document(DocumentBase):
    id: int
    project_id: str
    file_path: str
    upload_date: datetime

    class Config:
        from_attributes = True

# --- Project Progress ---
class ProjectProgressBase(BaseModel):
    stage_name: str
    percentage_update: int
    notes: Optional[str] = None

class ProjectProgressCreate(ProjectProgressBase):
    project_id: str

class ProjectProgress(ProjectProgressBase):
    id: int
    project_id: str
    photo_path: Optional[str] = None
    update_date: datetime

    class Config:
        from_attributes = True

# --- Invoice ---
class InvoiceBase(BaseModel):
    date: date
    paid_date: date
    subtotal: float
    total_amount: float
    status: str
    description: Optional[str] = "Initial payment"
    notes: Optional[str] = None

class InvoiceCreate(InvoiceBase):
    project_id: str

class InvoiceUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

class Invoice(InvoiceBase):
    id: str
    project_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Project Materials ---
class ProjectMaterialBase(BaseModel):
    name: str
    total_quantity: float
    used_quantity: Optional[float] = 0.0
    unit: str

class ProjectMaterialCreate(ProjectMaterialBase):
    project_id: str

class ProjectMaterialUpdate(BaseModel):
    name: Optional[str] = None
    total_quantity: Optional[float] = None
    used_quantity: Optional[float] = None
    unit: Optional[str] = None

class ProjectMaterial(ProjectMaterialBase):
    id: int
    project_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
