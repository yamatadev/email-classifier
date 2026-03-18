import re
import logging

import nltk
from nltk.corpus import stopwords
from nltk.stem import RSLPStemmer, SnowballStemmer

logger = logging.getLogger("mailsense")

# ── NLTK data bootstrap ─────────────────────────────────────────────────────
_REQUIRED_NLTK = ["stopwords", "rslp"]

for corpus in _REQUIRED_NLTK:
    try:
        nltk.data.find(f"corpora/{corpus}" if corpus == "stopwords" else f"stemmers/{corpus}")
    except LookupError:
        logger.info("Downloading NLTK data: %s", corpus)
        nltk.download(corpus, quiet=True)

# ── Module-level singletons (Q3.3 — avoid recreating on every call) ──────────
_STOPWORDS_PT = set(stopwords.words("portuguese"))
_STOPWORDS_EN = set(stopwords.words("english"))
_ALL_STOPWORDS = _STOPWORDS_PT | _STOPWORDS_EN
_STEMMER_PT = RSLPStemmer()
_STEMMER_EN = SnowballStemmer("english")

# ── Improved regex: keep numbers, @, #, $, % (Q6.3) ─────────────────────────
_CLEAN_RE = re.compile(r"[^a-záàâãéèêíïóôõöúüçña-z0-9@#$%\s]", re.IGNORECASE)
_MULTI_SPACE_RE = re.compile(r"\s+")


def preprocess_text(text: str, lang: str = "pt-BR") -> str:
    """Pre-process email text for NLP analysis.

    Improvements over the original:
    - Keeps numbers, @, #, $, % symbols (Q6.3)
    - Minimum token length lowered to 1 to keep acronyms like AI, IT, HR (Q6.4)
    - Language-aware stemming: RSLP for Portuguese, Snowball for English (Q6.2)
    """
    text = text.lower()
    text = _CLEAN_RE.sub(" ", text)
    text = _MULTI_SPACE_RE.sub(" ", text).strip()

    try:
        sw = _STOPWORDS_PT if lang == "pt-BR" else _STOPWORDS_EN
        tokens = [t for t in text.split() if t not in sw and len(t) > 1]

        stemmer = _STEMMER_PT if lang == "pt-BR" else _STEMMER_EN
        return " ".join(stemmer.stem(t) for t in tokens)
    except Exception:
        logger.warning("NLP preprocessing failed, returning cleaned text")
        return text
