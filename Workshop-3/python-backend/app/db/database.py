from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.models.base import Base


engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    # Database tables are created by the SQL script (00-setup-complete-database.sql)
    # Do not use Base.metadata.create_all() as it cannot create PostgreSQL ENUMs
    # Run the setup script first: scripts/setup-database.ps1 or setup-database.sh
    # Base.metadata.create_all(bind=engine)
    pass
