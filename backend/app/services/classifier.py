import json
import re
import logging
import asyncio
from functools import partial

import anthropic

from app.config import settings
from app.services.nlp import preprocess_text
from app.utils.cache import classification_cache

logger = logging.getLogger("mailsense")

# ── Anthropic client (created once) ─────────────────────────────────────────
_client = anthropic.Anthropic(
    api_key=settings.ANTHROPIC_API_KEY,
    timeout=settings.CLAUDE_TIMEOUT,
    max_retries=settings.CLAUDE_MAX_RETRIES,
)

# ── System prompts ───────────────────────────────────────────────────────────
SYSTEM_PROMPT_PT = """Você é um sistema especializado em triagem de emails corporativos para uma grande instituição financeira.

Analise o email fornecido e retorne APENAS um JSON válido (sem markdown, sem texto extra) no formato abaixo:

{
  "classification": "PRODUTIVO" ou "IMPRODUTIVO",
  "confidence": número entre 0.0 e 1.0,
  "reason": "justificativa objetiva da classificação em 1-2 frases",
  "priority": "ALTA", "MEDIA" ou "BAIXA",
  "key_topics": ["lista", "de", "tópicos", "identificados"],
  "suggested_subject": "Assunto para a resposta automática",
  "suggested_response": "Resposta automática completa, profissional e adequada ao contexto financeiro"
}

Critérios:
- PRODUTIVO: requer ação ou resposta (suporte, solicitações, atualizações de casos, dúvidas operacionais, contratos, relatórios, reclamações)
- IMPRODUTIVO: não requer ação imediata (felicitações, agradecimentos, mensagens sociais, spam informativo)

Prioridade para PRODUTIVOS: ALTA (urgente/prazo), MEDIA (padrão), BAIXA (informativo)
Prioridade para IMPRODUTIVOS: sempre BAIXA

IMPORTANTE: Responda SOMENTE com o JSON. Sem markdown, sem explicações, sem texto antes ou depois.
Responda todos os campos de texto (reason, key_topics, suggested_subject, suggested_response) em PORTUGUÊS BRASILEIRO.
A resposta sugerida deve soar natural, profissional e representar bem uma instituição financeira de grande porte."""

SYSTEM_PROMPT_EN = """You are a specialized corporate email triage system for a large financial institution.

Analyze the provided email and return ONLY valid JSON (no markdown, no extra text) in the format below:

{
  "classification": "PRODUTIVO" or "IMPRODUTIVO",
  "confidence": number between 0.0 and 1.0,
  "reason": "objective justification of the classification in 1-2 sentences",
  "priority": "ALTA", "MEDIA" or "BAIXA",
  "key_topics": ["list", "of", "identified", "topics"],
  "suggested_subject": "Subject line for the automated reply",
  "suggested_response": "Complete, professional automated reply appropriate for a major financial institution"
}

Note: classification and priority values must remain as shown above (PRODUTIVO/IMPRODUTIVO, ALTA/MEDIA/BAIXA) — they are internal system codes.

Criteria:
- PRODUTIVO: requires action or response (support, requests, case updates, operational questions, contracts, reports, complaints)
- IMPRODUTIVO: requires no immediate action (greetings, thank-yous, social messages, informational spam)

Priority for PRODUTIVO: ALTA (urgent/deadline), MEDIA (standard), BAIXA (informational)
Priority for IMPRODUTIVO: always BAIXA

IMPORTANT: Respond with ONLY the JSON. No markdown, no explanations, no text before or after.
Respond with all text fields (reason, key_topics, suggested_subject, suggested_response) in ENGLISH.
The suggested response should sound natural, professional, and represent a major financial institution well."""

# ── JSON extraction regex (Q7.5 — more robust parsing) ──────────────────────
_JSON_BLOCK_RE = re.compile(r"```(?:json)?\s*([\s\S]*?)\s*```")
_JSON_OBJECT_RE = re.compile(r"\{[\s\S]*\}")


def _extract_json(text: str) -> dict:
    """Robustly extract JSON from Claude's response."""
    text = text.strip()

    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try extracting from markdown code block
    match = _JSON_BLOCK_RE.search(text)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    # Try extracting any JSON object
    match = _JSON_OBJECT_RE.search(text)
    if match:
        return json.loads(match.group(0))

    raise json.JSONDecodeError("No valid JSON found in response", text, 0)


def _classify_sync(raw_text: str, lang: str = "pt-BR") -> dict:
    """Synchronous email classification (runs in thread pool for async)."""
    # Check cache first
    cached = classification_cache.get(raw_text, lang)
    if cached is not None:
        logger.info("Returning cached classification result")
        return cached

    processed_text = preprocess_text(raw_text, lang=lang)
    system_prompt = SYSTEM_PROMPT_EN if lang == "en-US" else SYSTEM_PROMPT_PT

    logger.info(
        "Calling Claude API: model=%s, input_len=%d, processed_len=%d",
        settings.CLAUDE_MODEL,
        len(raw_text),
        len(processed_text),
    )

    message = _client.messages.create(
        model=settings.CLAUDE_MODEL,
        max_tokens=1024,
        system=system_prompt,
        messages=[
            {
                "role": "user",
                "content": f"Original email:\n{raw_text}\n\nPre-processed text (NLP):\n{processed_text}",
            }
        ],
    )

    response_text = message.content[0].text.strip()
    result = _extract_json(response_text)
    result["processed_text_preview"] = (
        processed_text[:200] + ("..." if len(processed_text) > 200 else "")
    )
    result["original_length"] = len(raw_text)
    result["processed_length"] = len(processed_text)

    # Cache the result
    classification_cache.set(raw_text, lang, result)
    logger.info(
        "Classification complete: %s (confidence=%.2f)",
        result.get("classification", "?"),
        result.get("confidence", 0),
    )
    return result


async def classify_email(raw_text: str, lang: str = "pt-BR") -> dict:
    """Async wrapper — runs Claude API call in thread pool."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, partial(_classify_sync, raw_text, lang))
