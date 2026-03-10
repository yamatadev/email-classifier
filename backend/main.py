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

app = FastAPI(title="Email Classifier", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

SYSTEM_PROMPT = """Você é um sistema especializado em triagem de emails corporativos para uma grande instituição financeira.

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

A resposta sugerida deve soar natural, profissional e representar bem uma instituição financeira de grande porte."""


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


def classify_email(raw_text: str) -> dict:
    processed_text = preprocess_text(raw_text)
    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[{
            "role": "user",
            "content": f"Email original:\n{raw_text}\n\nTexto pré-processado (NLP):\n{processed_text}",
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

class GmailRequest(BaseModel):
    email: str
    app_password: str
    limit: int = 10


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "Email Classifier API", "version": "2.0.0"}

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
        result = classify_email(request.text)
        return {"success": True, "data": result}
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"AI response parsing error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Error: {str(e)}")


@app.post("/analyze/file")
async def analyze_file(file: UploadFile = File(...)):
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
        result = classify_email(text)
        return {"success": True, "data": result, "filename": file.filename}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")


@app.post("/analyze/batch")
async def analyze_batch(files: List[UploadFile] = File(...)):
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
            data = classify_email(text)
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
            detail="Falha na autenticação Gmail. Verifique o email e o App Password. Certifique-se de que o IMAP está habilitado nas configurações do Gmail."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gmail connection error: {str(e)}")

    results = []
    for em in emails:
        full_text = f"De: {em['sender']}\nAssunto: {em['subject']}\nData: {em['date']}\n\n{em['body']}"
        if not full_text.strip():
            continue
        try:
            data = classify_email(full_text[:8000])
            results.append({"subject": em["subject"], "sender": em["sender"], "date": em["date"], "success": True, "data": data})
        except Exception as e:
            results.append({"subject": em["subject"], "sender": em["sender"], "date": em["date"], "success": False, "error": str(e)})

    return {"success": True, "total": len(results), "account": request.email, "results": results}
