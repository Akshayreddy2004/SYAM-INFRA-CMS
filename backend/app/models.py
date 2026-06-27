from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="Admin") # Admin, Manager, Viewer
    is_active = Column(Boolean, default=True)
    avatar = Column(String, nullable=True)



class Project(Base):
    __tablename__ = "projects"
    id = Column(String, primary_key=True, index=True) # E.g. PRJ-001
    name = Column(String, index=True)
    client_name = Column(String, index=True)
    client_phone = Column(String)
    location = Column(String)
    value = Column(Float)
    start_date = Column(Date)
    expected_completion = Column(Date)
    status = Column(String, default="Ongoing")
    project_type = Column(String, default="Cement + Interiors") # Cement + Interiors, Cement Work Only, Interiors
    progress_percentage = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)
    

    schedules = relationship("PaymentSchedule", back_populates="project")
    expenses = relationship("Expense", back_populates="project")
    documents = relationship("Document", back_populates="project")
    progress_updates = relationship("ProjectProgress", back_populates="project")
    invoices = relationship("Invoice", back_populates="project")
    materials = relationship("ProjectMaterial", back_populates="project")

class PaymentSchedule(Base):
    __tablename__ = "payment_schedules"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id"))
    stage_name = Column(String)
    expected_amount = Column(Float)
    due_date = Column(Date)
    amount_received = Column(Float, default=0.0)
    status = Column(String, default="Pending") # Pending, Partial, Paid
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)
    
    project = relationship("Project", back_populates="schedules")
    history = relationship("PaymentHistory", back_populates="schedule")

class PaymentHistory(Base):
    __tablename__ = "payment_history"
    id = Column(Integer, primary_key=True, index=True)
    schedule_id = Column(Integer, ForeignKey("payment_schedules.id"))
    amount = Column(Float)
    payment_date = Column(Date)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    schedule = relationship("PaymentSchedule", back_populates="history")

class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id"))
    date = Column(Date)
    category = Column(String) # Material, Labor, Machinery, Transportation, Miscellaneous
    amount = Column(Float)
    description = Column(Text)
    bill_file_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)
    
    project = relationship("Project", back_populates="expenses")

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id"))
    name = Column(String)
    type = Column(String) # Agreement, BOQ, etc.
    file_path = Column(String)
    upload_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)
    
    project = relationship("Project", back_populates="documents")

class ProjectProgress(Base):
    __tablename__ = "project_progress"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id"))
    stage_name = Column(String)
    percentage_update = Column(Integer)
    notes = Column(Text)
    photo_path = Column(String, nullable=True)
    update_date = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("Project", back_populates="progress_updates")

class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(String, primary_key=True, index=True) # E.g. INV-001
    project_id = Column(String, ForeignKey("projects.id"))
    date = Column(Date)
    paid_date = Column(Date)
    subtotal = Column(Float)
    total_amount = Column(Float)
    status = Column(String, default="Draft") # Draft, Sent, Paid, Overdue
    description = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)
    
    project = relationship("Project", back_populates="invoices")

class ProjectMaterial(Base):
    __tablename__ = "project_materials"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id"))
    name = Column(String)
    total_quantity = Column(Float, default=0.0)
    used_quantity = Column(Float, default=0.0)
    unit = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)
    
    project = relationship("Project", back_populates="materials")
