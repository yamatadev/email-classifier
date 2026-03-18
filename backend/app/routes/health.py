import logging

from fastapi import APIRouter
import nltk

from app.config import settings

logger = logging.getLogger("mailsense")
router = APIRouter()


@router.get("/")
def root():
    return {"status": "MailSense Email Classifier API", "version": "2.1.0"}


@router.get("/health")
def health():
    """Deep health check — verifies dependencies are available."""
    checks = {"api": True, "nltk_stopwords": False, "nltk_rslp": False, "anthropic_key": False}

    try:
        nltk.data.find("corpora/stopwords")
        checks["nltk_stopwords"] = True
    except LookupError:
        pass

    try:
        nltk.data.find("stemmers/rslp")
        checks["nltk_rslp"] = True
    except LookupError:
        pass

    checks["anthropic_key"] = bool(settings.ANTHROPIC_API_KEY)

    all_healthy = all(checks.values())
    return {
        "status": "healthy" if all_healthy else "degraded",
        "checks": checks,
    }
