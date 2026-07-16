from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings
import os

DATABASE_URL = settings.DATABASE_URL

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def run_migrations():
    """Add any missing columns to existing SQLite tables without dropping data."""
    if not DATABASE_URL.startswith("sqlite"):
        return
    inspector = inspect(engine)
    expected = {
        "providers": {"earnings": "FLOAT"},
        "payments": {"commission": "FLOAT"},
    }
    for table, columns in expected.items():
        if not inspector.has_table(table):
            continue
        existing = {c["name"] for c in inspector.get_columns(table)}
        with engine.begin() as conn:
            for col_name, col_type in columns.items():
                if col_name not in existing:
                    conn.execute(text(f'ALTER TABLE {table} ADD COLUMN {col_name} {col_type} DEFAULT 0'))
