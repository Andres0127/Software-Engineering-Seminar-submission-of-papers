from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    PROJECT_NAME: str = "Event Platform API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # JWT Configuration (must match Java backend)
    JWT_SECRET: str = (
        "your-256-bit-secret-key-change-this-in-production-make-it-very-long-and-secure"
    )
    JWT_ALGORITHM: str = "HS256"
    JWT_ALGORITHMS: List[str] = ["HS256", "HS384", "HS512"]

    # Database Configuration (can be overridden by environment variables)
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/eventplatform"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "eventplatform"

    # CORS (can be overridden by environment variables)
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:80"]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

# Build DATABASE_URL from individual components if DATABASE_URL not directly provided
if not os.getenv("DATABASE_URL"):
    settings.DATABASE_URL = f"postgresql://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"
