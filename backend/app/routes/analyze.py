import json
import asyncio
import logging
from typing import List

from fastapi import APIRouter, File, UploadFile, HTTPException, Request

from app.config import settings
from app.models.schemas import TextRequest
from app.services.classifier import classify_email
from app.services.pdf import extract_text_from_pdf
from app.middleware.rate_limit import limiter

logger = logging.getLogger("mailsense")
router = APIRouter(prefix="/analyze", tags=["Analysis"])


@router.post("/text")
@limiter.limit("30/minute")
async def analyze_text(request: Request, body: TextRequest):
    if not body.text.strip():
        raise HTTPException(status_code=400, detail="Email text cannot be empty")
    if len(body.text) > settings.MAX_TEXT_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Email text too long (max {settings.MAX_TEXT_LENGTH} chars)",
        )
    try:
        result = await classify_email(body.text, lang=body.lang)
        return {"success": True, "data": result}
    except json.JSONDecodeError:
        logger.exception("JSON parse error from Claude response")
        raise HTTPException(status_code=500, detail="AI response parsing error")
    except Exception:
        logger.exception("Classification failed")
        raise HTTPException(status_code=502, detail="Classification service temporarily unavailable")


@router.post("/file")
@limiter.limit("20/minute")
async def analyze_file(request: Request, file: UploadFile = File(...), lang: str = "pt-BR"):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    if not file.filename.endswith((".txt", ".pdf")):
        raise HTTPException(status_code=400, detail="Only .txt and .pdf files are supported")
    file_bytes = await file.read()
    if len(file_bytes) > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")
    try:
        text = (
            extract_text_from_pdf(file_bytes)
            if file.filename.endswith(".pdf")
            else file_bytes.decode("utf-8", errors="ignore")
        )
        if not text.strip():
            raise HTTPException(status_code=422, detail="File appears to be empty")
        result = await classify_email(text, lang=lang)
        return {"success": True, "data": result, "filename": file.filename}
    except HTTPException:
        raise
    except Exception:
        logger.exception("File processing failed")
        raise HTTPException(status_code=500, detail="File processing error")


@router.post("/batch")
@limiter.limit("10/minute")
async def analyze_batch(
    request: Request,
    files: List[UploadFile] = File(...),
    lang: str = "pt-BR",
):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    if len(files) > settings.MAX_BATCH_FILES:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {settings.MAX_BATCH_FILES} files per batch",
        )

    # Read and validate all files first
    file_data = []
    results = []
    for file in files:
        if not file.filename.endswith((".txt", ".pdf")):
            results.append({"filename": file.filename, "success": False, "error": "Unsupported format"})
            continue
        file_bytes = await file.read()
        if len(file_bytes) > settings.MAX_FILE_SIZE:
            results.append({"filename": file.filename, "success": False, "error": "File too large"})
            continue
        try:
            text = (
                extract_text_from_pdf(file_bytes)
                if file.filename.endswith(".pdf")
                else file_bytes.decode("utf-8", errors="ignore")
            )
            if not text.strip():
                results.append({"filename": file.filename, "success": False, "error": "Empty file"})
                continue
            file_data.append((file.filename, text))
        except Exception as e:
            results.append({"filename": file.filename, "success": False, "error": str(e)})

    # Classify in parallel (Q3.1)
    if file_data:
        logger.info("Batch classifying %d files in parallel", len(file_data))
        tasks = [classify_email(text, lang=lang) for _, text in file_data]
        classify_results = await asyncio.gather(*tasks, return_exceptions=True)

        for (filename, _), res in zip(file_data, classify_results):
            if isinstance(res, Exception):
                logger.error("Batch item %s failed: %s", filename, res)
                results.append({"filename": filename, "success": False, "error": "Classification failed"})
            else:
                results.append({"filename": filename, "success": True, "data": res})

    return {"success": True, "total": len(results), "results": results}
