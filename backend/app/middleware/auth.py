import secrets
import logging

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse, Response

from app.config import settings

logger = logging.getLogger("mailsense")

# Public routes that don't require authentication
PUBLIC_PATHS = {"/", "/health", "/docs", "/openapi.json", "/redoc"}


class ApiKeyAuthMiddleware(BaseHTTPMiddleware):
    """Simple API key authentication middleware.

    The frontend obtains a session key by calling a public endpoint,
    then sends it as `Authorization: Bearer <key>` on subsequent requests.

    For development/demo purposes, the key in .env is used directly.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        path = request.url.path

        # Allow public paths and CORS preflight
        if path in PUBLIC_PATHS or request.method == "OPTIONS":
            return await call_next(request)

        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            logger.warning("Missing or malformed Authorization header for %s", path)
            return JSONResponse(
                status_code=401,
                content={"detail": "Authentication required. Provide Authorization: Bearer <api_key>"},
            )

        token = auth_header.removeprefix("Bearer ").strip()
        if not secrets.compare_digest(token, settings.API_SECRET_KEY):
            logger.warning("Invalid API key attempt for %s", path)
            return JSONResponse(
                status_code=403,
                content={"detail": "Invalid API key"},
            )

        return await call_next(request)
