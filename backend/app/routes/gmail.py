import imaplib
import asyncio
import logging

from fastapi import APIRouter, HTTPException, Request

from app.config import settings
from app.models.schemas import GmailRequest
from app.services.gmail import fetch_gmail_emails
from app.services.classifier import classify_email
from app.middleware.rate_limit import limiter

logger = logging.getLogger("mailsense")
router = APIRouter(prefix="/gmail", tags=["Gmail"])


@router.post("/fetch-and-analyze")
@limiter.limit("10/minute")
async def gmail_fetch_and_analyze(request: Request, body: GmailRequest):
    if body.limit > settings.MAX_GMAIL_EMAILS:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {settings.MAX_GMAIL_EMAILS} emails per fetch",
        )

    # Log without exposing credentials (Q1.4)
    masked_email = body.email.split("@")[0][:3] + "***@" + body.email.split("@")[-1]
    logger.info("Gmail fetch request: %s (limit=%d, folder=%s)", masked_email, body.limit, body.folder)

    try:
        emails = fetch_gmail_emails(
            body.email, body.app_password, body.limit, body.folder
        )
    except imaplib.IMAP4.error:
        raise HTTPException(
            status_code=401,
            detail="Gmail authentication failed. Check your email and App Password. Make sure IMAP is enabled in Gmail settings.",
        )
    except Exception:
        logger.exception("Gmail connection error")
        raise HTTPException(status_code=500, detail="Gmail connection error")

    # Classify in parallel (Q3.2)
    tasks = []
    valid_emails = []
    for em in emails:
        body_text = em["body"].strip()
        if not body_text:  # (Q4.8 — check actual body, not formatted string)
            continue
        full_text = f"From: {em['sender']}\nSubject: {em['subject']}\nDate: {em['date']}\n\n{em['body']}"
        tasks.append(classify_email(full_text[:8000], lang=body.lang))
        valid_emails.append(em)

    results = []
    if tasks:
        logger.info("Classifying %d Gmail emails in parallel", len(tasks))
        classify_results = await asyncio.gather(*tasks, return_exceptions=True)
        for em, res in zip(valid_emails, classify_results):
            if isinstance(res, Exception):
                logger.error("Gmail classification failed for '%s': %s", em["subject"][:30], res)
                results.append({
                    "subject": em["subject"],
                    "sender": em["sender"],
                    "date": em["date"],
                    "success": False,
                    "error": "Classification failed",
                })
            else:
                results.append({
                    "subject": em["subject"],
                    "sender": em["sender"],
                    "date": em["date"],
                    "success": True,
                    "data": res,
                })

    return {
        "success": True,
        "total": len(results),
        "account": masked_email,
        "results": results,
    }
