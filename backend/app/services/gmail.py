import imaplib
import email
import logging
from email.header import decode_header

logger = logging.getLogger("mailsense")


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


def fetch_gmail_emails(
    gmail_user: str,
    app_password: str,
    limit: int = 10,
    folder: str = "INBOX",
) -> list:
    """Fetch emails from Gmail via IMAP.

    Note: This function does NOT delete any emails. It is read-only. (Q10.7)
    """
    logger.info(
        "Connecting to Gmail IMAP for %s (folder=%s, limit=%d)",
        gmail_user.split("@")[0] + "@***",
        folder,
        limit,
    )
    imap = imaplib.IMAP4_SSL("imap.gmail.com", 993)
    try:
        imap.login(gmail_user, app_password)
        imap.select(folder, readonly=True)  # readonly=True ensures no deletions
        _, data = imap.search(None, "ALL")
        all_ids = data[0].split()
        selected_ids = list(
            reversed(all_ids[-limit:] if len(all_ids) >= limit else all_ids)
        )
        emails = []
        for uid in selected_ids:
            _, msg_data = imap.fetch(uid, "(RFC822)")
            raw = msg_data[0][1]
            msg = email.message_from_bytes(raw)
            emails.append(
                {
                    "subject": decode_mime_words(msg.get("Subject", "")),
                    "sender": decode_mime_words(msg.get("From", "")),
                    "date": msg.get("Date", ""),
                    "body": get_email_body(msg),
                }
            )
        logger.info("Fetched %d emails from %s", len(emails), folder)
        return emails
    finally:
        try:
            imap.logout()
        except Exception:
            pass
