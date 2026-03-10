import os
import json
import re
import io
import imaplib
import email
from email.header import decode_header
from typing import List

import anthropic
import pypdf
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import nltk
from nltk.corpus import stopwords
from nltk.stem import RSLPStemmer
from dotenv import load_dotenv

load_dotenv()

try:
    nltk.data.find("corpora/stopwords")
except LookupError:
    nltk.download("stopwords", quiet=True)

app = FastAPI(title="AutoU Email Classifier", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

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

Respond with all text fields (reason, key_topics, suggested_subject, suggested_response) in ENGLISH.
The suggested response should sound natural, professional, and represent a major financial institution well."""


def preprocess_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-záàâãéèêíïóôõöúüçñ\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    try:
        all_stopwords = set(stopwords.words("portuguese")) | set(stopwords.words("english"))
        tokens = [t for t in text.split() if t not in all_stopwords and len(t) > 2]
        stemmer = RSLPStemmer()
        return " ".join(stemmer.stem(t) for t in tokens)
    except Exception:
        return text


def extract_text_from_pdf(file_bytes: bytes) -> str:
    reader = pypdf.PdfReader(io.BytesIO(file_bytes))
    return "".join(page.extract_text() or "" for page in reader.pages).strip()


def classify_email(raw_text: str, lang: str = "pt-BR") -> dict:
    processed_text = preprocess_text(raw_text)
    system_prompt = SYSTEM_PROMPT_EN if lang == "en-US" else SYSTEM_PROMPT_PT
    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        system=system_prompt,
        messages=[{
            "role": "user",
            "content": f"Original email:\n{raw_text}\n\nPre-processed text (NLP):\n{processed_text}",
        }],
    )
    response_text = message.content[0].text.strip()
    response_text = re.sub(r"^```json\s*|^```\s*|\s*```$", "", response_text)
    result = json.loads(response_text)
    result["processed_text_preview"] = processed_text[:200] + ("..." if len(processed_text) > 200 else "")
    result["original_length"] = len(raw_text)
    result["processed_length"] = len(processed_text)
    return result


# ─── Gmail IMAP ───────────────────────────────────────────────────────────────

def decode_mime_words(s: str) -> str:
    if not s:
        return ""
    parts = decode_header(s)
    decoded = []
    for part, enc in parts:
        if isinstance(part, bytes):
            decoded.append(part.decode(enc or "utf-8", errors="ignore"))
        else:
            decoded.append(part)
    return " ".join(decoded)


def get_email_body(msg) -> str:
    body = ""
    if msg.is_multipart():
        for part in msg.walk():
            ct = part.get_content_type()
            cd = str(part.get("Content-Disposition", ""))
            if ct == "text/plain" and "attachment" not in cd:
                payload = part.get_payload(decode=True)
                if payload:
                    charset = part.get_content_charset() or "utf-8"
                    body += payload.decode(charset, errors="ignore")
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            charset = msg.get_content_charset() or "utf-8"
            body = payload.decode(charset, errors="ignore")
    return body.strip()


def fetch_gmail_emails(gmail_user: str, app_password: str, limit: int = 10) -> list:
    imap = imaplib.IMAP4_SSL("imap.gmail.com", 993)
    imap.login(gmail_user, app_password)
    imap.select("INBOX")
    _, data = imap.search(None, "ALL")
    all_ids = data[0].split()
    selected_ids = list(reversed(all_ids[-limit:] if len(all_ids) >= limit else all_ids))
    emails = []
    for uid in selected_ids:
        _, msg_data = imap.fetch(uid, "(RFC822)")
        raw = msg_data[0][1]
        msg = email.message_from_bytes(raw)
        emails.append({
            "subject": decode_mime_words(msg.get("Subject", "(sem assunto)")),
            "sender": decode_mime_words(msg.get("From", "")),
            "date": msg.get("Date", ""),
            "body": get_email_body(msg),
        })
    imap.logout()
    return emails


# ─── Models ───────────────────────────────────────────────────────────────────

class TextRequest(BaseModel):
    text: str
    lang: str = "pt-BR"

class GmailRequest(BaseModel):
    email: str
    app_password: str
    limit: int = 10
    lang: str = "pt-BR"


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "MailSense Email Classifier API", "version": "2.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/analyze/text")
def analyze_text(request: TextRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Email text cannot be empty")
    if len(request.text) > 50000:
        raise HTTPException(status_code=400, detail="Email text too long (max 50000 chars)")
    try:
        result = classify_email(request.text, lang=request.lang)
        return {"success": True, "data": result}
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"AI response parsing error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Error: {str(e)}")


@app.post("/analyze/file")
async def analyze_file(file: UploadFile = File(...), lang: str = "pt-BR"):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    if not file.filename.endswith((".txt", ".pdf")):
        raise HTTPException(status_code=400, detail="Only .txt and .pdf files are supported")
    file_bytes = await file.read()
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")
    try:
        text = extract_text_from_pdf(file_bytes) if file.filename.endswith(".pdf") else file_bytes.decode("utf-8", errors="ignore")
        if not text.strip():
            raise HTTPException(status_code=422, detail="File appears to be empty")
        result = classify_email(text, lang=lang)
        return {"success": True, "data": result, "filename": file.filename}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")


@app.post("/analyze/batch")
async def analyze_batch(files: List[UploadFile] = File(...), lang: str = "pt-BR"):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    if len(files) > 20:
        raise HTTPException(status_code=400, detail="Maximum 20 files per batch")
    results = []
    for file in files:
        if not file.filename.endswith((".txt", ".pdf")):
            results.append({"filename": file.filename, "success": False, "error": "Unsupported format"})
            continue
        file_bytes = await file.read()
        if len(file_bytes) > 5 * 1024 * 1024:
            results.append({"filename": file.filename, "success": False, "error": "File too large"})
            continue
        try:
            text = extract_text_from_pdf(file_bytes) if file.filename.endswith(".pdf") else file_bytes.decode("utf-8", errors="ignore")
            if not text.strip():
                results.append({"filename": file.filename, "success": False, "error": "Empty file"})
                continue
            data = classify_email(text, lang=lang)
            results.append({"filename": file.filename, "success": True, "data": data})
        except Exception as e:
            results.append({"filename": file.filename, "success": False, "error": str(e)})
    return {"success": True, "total": len(results), "results": results}


@app.post("/gmail/fetch-and-analyze")
def gmail_fetch_and_analyze(request: GmailRequest):
    if request.limit > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 emails per fetch")
    try:
        emails = fetch_gmail_emails(request.email, request.app_password, request.limit)
    except imaplib.IMAP4.error:
        raise HTTPException(
            status_code=401,
            detail="Gmail authentication failed. Check your email and App Password. Make sure IMAP is enabled in Gmail settings."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gmail connection error: {str(e)}")

    results = []
    for em in emails:
        full_text = f"From: {em['sender']}\nSubject: {em['subject']}\nDate: {em['date']}\n\n{em['body']}"
        if not full_text.strip():
            continue
        try:
            data = classify_email(full_text[:8000], lang=request.lang)
            results.append({"subject": em["subject"], "sender": em["sender"], "date": em["date"], "success": True, "data": data})
        except Exception as e:
            results.append({"subject": em["subject"], "sender": em["sender"], "date": em["date"], "success": False, "error": str(e)})

    return {"success": True, "total": len(results), "account": request.email, "results": results}
