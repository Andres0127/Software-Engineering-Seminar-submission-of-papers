
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .config import settings

# SQLite doesn't support pool_size and max_overflow
database_url = settings.DATABASE_URL
if database_url.startswith('sqlite'):
    engine = create_engine(
        database_url,
        pool_pre_ping=True,
        connect_args={"check_same_thread": False} if "sqlite" in database_url.lower() else {}
    )
else:
    engine = create_engine(
        database_url,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10
    )
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
