from pydantic import BaseModel, Field


class TextRequest(BaseModel):
    text: str
    lang: str = "pt-BR"


class GmailRequest(BaseModel):
    email: str
    app_password: str
    limit: int = Field(default=10, ge=1, le=10)
    lang: str = "pt-BR"
    folder: str = "INBOX"


class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=10, ge=1, le=50)
