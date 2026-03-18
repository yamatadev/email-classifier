"""Thin entry point — keeps `uvicorn main:app` working for Render deploy."""
from app.main import app  # noqa: F401
