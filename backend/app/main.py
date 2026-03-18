import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.utils.logging import setup_logging
from app.middleware.request_id import RequestIdMiddleware
from app.middleware.auth import ApiKeyAuthMiddleware
from app.middleware.rate_limit import limiter, rate_limit_handler
from app.routes import health, analyze, gmail

logger = logging.getLogger("mailsense")


def create_app() -> FastAPI:
    """Application factory — builds and configures the FastAPI app."""
    setup_logging()

    # Validate settings early (Q5.8)
    settings.validate()

    application = FastAPI(title="MailSense Email Classifier", version="2.1.0")

    # ── Middleware (order matters: outermost first) ───────────────────────
    application.add_middleware(RequestIdMiddleware)
    application.add_middleware(ApiKeyAuthMiddleware)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,  # (Q1.2 — restricted)
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Rate limiting ────────────────────────────────────────────────────
    application.state.limiter = limiter
    application.add_exception_handler(RateLimitExceeded, rate_limit_handler)

    # ── Routes ───────────────────────────────────────────────────────────
    application.include_router(health.router)
    application.include_router(analyze.router)
    application.include_router(gmail.router)

    logger.info("MailSense API initialized (origins=%s)", settings.ALLOWED_ORIGINS)
    return application


app = create_app()
