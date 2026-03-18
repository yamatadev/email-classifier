import uuid
import logging
from contextvars import ContextVar

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("mailsense")

request_id_var: ContextVar[str] = ContextVar("request_id", default="")


class RequestIdMiddleware(BaseHTTPMiddleware):
    """Assigns a unique request ID to every request for traceability."""

    async def dispatch(self, request: Request, call_next) -> Response:
        rid = request.headers.get("X-Request-ID", str(uuid.uuid4())[:8])
        request_id_var.set(rid)
        logger.info(
            "request_id=%s method=%s path=%s",
            rid,
            request.method,
            request.url.path,
        )
        response: Response = await call_next(request)
        response.headers["X-Request-ID"] = rid
        return response
