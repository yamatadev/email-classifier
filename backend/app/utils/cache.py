import hashlib
import time
import logging
from typing import Any, Dict, Optional, Tuple

logger = logging.getLogger("mailsense")


class SimpleCache:
    """Thread-safe in-memory cache with TTL."""

    def __init__(self, ttl: int = 300, max_size: int = 200):
        self._store: Dict[str, Tuple[float, Any]] = {}
        self._ttl = ttl
        self._max_size = max_size

    @staticmethod
    def _make_key(text: str, lang: str) -> str:
        content = f"{text}:{lang}"
        return hashlib.sha256(content.encode()).hexdigest()

    def get(self, text: str, lang: str) -> Optional[Any]:
        key = self._make_key(text, lang)
        entry = self._store.get(key)
        if entry is None:
            return None
        ts, value = entry
        if time.time() - ts > self._ttl:
            del self._store[key]
            return None
        logger.debug("Cache hit for key %s", key[:12])
        return value

    def set(self, text: str, lang: str, value: Any) -> None:
        if len(self._store) >= self._max_size:
            self._evict()
        key = self._make_key(text, lang)
        self._store[key] = (time.time(), value)

    def _evict(self) -> None:
        """Remove oldest entries when cache is full."""
        sorted_keys = sorted(self._store, key=lambda k: self._store[k][0])
        for key in sorted_keys[: len(sorted_keys) // 4]:
            del self._store[key]


classification_cache = SimpleCache()
