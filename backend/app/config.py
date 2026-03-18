import os
import logging
from typing import List

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("mailsense")


class Settings:
    """Application settings loaded from environment variables."""

    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    ALLOWED_ORIGINS: List[str] = [
        o.strip()
        for o in os.getenv(
            "ALLOWED_ORIGINS",
            "https://email-classifier-flame.vercel.app,http://localhost:5173",
        ).split(",")
        if o.strip()
    ]
    API_SECRET_KEY: str = os.getenv(
        "API_SECRET_KEY", "mailsense-dev-key-change-in-production"
    )
    RATE_LIMIT: str = os.getenv("RATE_LIMIT", "30/minute")
    CLAUDE_MODEL: str = os.getenv("CLAUDE_MODEL", "claude-haiku-4-5-20251001")
    CLAUDE_TIMEOUT: int = int(os.getenv("CLAUDE_TIMEOUT", "60"))
    CLAUDE_MAX_RETRIES: int = int(os.getenv("CLAUDE_MAX_RETRIES", "2"))
    CACHE_TTL: int = int(os.getenv("CACHE_TTL", "300"))  # 5 minutes
    MAX_TEXT_LENGTH: int = 50_000
    MAX_FILE_SIZE: int = 5 * 1024 * 1024  # 5 MB
    MAX_BATCH_FILES: int = 20
    MAX_GMAIL_EMAILS: int = 10

    @classmethod
    def validate(cls) -> None:
        if not cls.ANTHROPIC_API_KEY:
            raise RuntimeError(
                "ANTHROPIC_API_KEY is not set. "
                "Please set it in your .env file or environment variables."
            )
        logger.info("Settings validated successfully")


settings = Settings()
