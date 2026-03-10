<div align="center">

# MailSense — Email Classifier

**Navigate / Navegue:**
[🇧🇷 Português](#português) · [🇺🇸 English](#english)

</div>

---

<a name="português"></a>

# 🇧🇷 Português

Solução de triagem inteligente de emails corporativos com classificação e geração de respostas automáticas via IA (Claude claude-opus-4-5), pipeline NLP em Python, integração nativa com Gmail, sistema de autenticação e interface web premium.

## 🔗 Links

- **App Online:** `[URL do deploy — preencher após deploy]`
- **Repositório:** `[URL do GitHub — preencher após push]`

---

## 🏗️ Estrutura do Repositório

```
email-classifier/
├── README.md
├── backend/
│   ├── main.py              # API FastAPI — endpoints, NLP, integração Claude e Gmail
│   ├── requirements.txt     # Dependências Python
│   ├── render.yaml          # Configuração deploy Render
│   └── .env.example         # Variáveis de ambiente necessárias
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Roteador de autenticação
│   │   ├── index.css        # Design system (variáveis, animações)
│   │   ├── main.jsx         # Entry point React
│   │   └── components/
│   │       ├── LoginPage.jsx  # Tela de login com split layout animado
│   │       └── MainApp.jsx    # App principal com todos os modos de análise
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
└── sample_emails/
    ├── produtivo_urgente.txt
    └── improdutivo_agradecimento.txt
```

---

## ⚙️ Como Rodar Localmente

### Pré-requisitos

- Python 3.10+
- Node.js 18+
- Chave de API da Anthropic (obter em console.anthropic.com)

### 1. Backend (FastAPI)

```bash
cd backend

python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt

python -c "import nltk; nltk.download('stopwords'); nltk.download('rslp')"

cp .env.example .env
# Abra o .env e insira sua ANTHROPIC_API_KEY

uvicorn main:app --reload --port 8000
```

Backend disponível em: `http://localhost:8000`
Documentação automática (Swagger): `http://localhost:8000/docs`

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

App disponível em: `http://localhost:5173`

### Credenciais de Acesso (Demo)

| Email | Senha | Perfil |
|-------|-------|--------|
| demo@autou.com.br | autou2025 | Analista Financeiro |
| admin@autou.com.br | admin123 | Gestor de Operações |

---

## 🚀 Deploy em Produção

### Backend → Render (gratuito)

1. Crie conta em render.com
2. New Web Service → conecte o repositório GitHub
3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt && python -c "import nltk; nltk.download('stopwords'); nltk.download('rslp')"`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Em **Environment Variables**, adicione: `ANTHROPIC_API_KEY = sua_chave_aqui`
5. Deploy → copie a URL gerada

### Frontend → Vercel

```bash
cd frontend
npm install -g vercel
vercel --prod
```

Configure a variável: `VITE_API_URL` = URL do backend no Render

---

## 🧠 Como Funciona

### Integração com Claude (Anthropic)

O núcleo de inteligência do MailSense é a API Claude claude-opus-4-5 da Anthropic. Após o pré-processamento NLP, o texto do email é enviado ao modelo com um system prompt estruturado que define os critérios de classificação para o contexto financeiro corporativo.

O modelo retorna um JSON com:
- `classification` — PRODUTIVO ou IMPRODUTIVO
- `confidence` — score de 0.0 a 1.0 (dinâmico, varia por email)
- `reason` — justificativa objetiva em 1-2 frases
- `priority` — ALTA, MEDIA ou BAIXA
- `key_topics` — tópicos identificados no conteúdo
- `suggested_subject` — assunto sugerido para a resposta
- `suggested_response` — resposta automática completa em PT-BR

### Integração com Gmail (IMAP)

A integração Gmail utiliza o protocolo IMAP via SSL (porta 993) com autenticação por App Password.

**Como gerar o App Password:**
1. Acesse myaccount.google.com → Segurança
2. Ative "Verificação em duas etapas" (obrigatório)
3. Acesse diretamente: myaccount.google.com/apppasswords
4. Crie uma senha com nome "MailSense" e copie os 16 caracteres

### Pipeline NLP

```
Texto bruto
    ↓
Lowercase + remoção de caracteres especiais (regex)
    ↓
Remoção de stopwords PT + EN (NLTK)
    ↓
Stemming com algoritmo RSLP (específico para português)
    ↓
Texto processado + original → Claude claude-opus-4-5
    ↓
JSON estruturado com classificação, confiança, resposta
```

---

## ✨ Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| **Texto livre** | Cola o conteúdo do email direto na interface |
| **Upload único** | Arquivo .txt ou .pdf (máx 5MB) |
| **Batch (múltiplos)** | Até 20 arquivos simultâneos com summary agregado |
| **Gmail** | Conecta via IMAP e analisa os últimos 5 ou 10 emails |
| **Confidence score** | Score dinâmico gerado pelo Claude por email |
| **Resposta sugerida** | Copiável com um clique, contextualizada ao setor financeiro |
| **Prioridade** | ALTA / MEDIA / BAIXA atribuída automaticamente |
| **Tópicos** | Extração automática dos temas principais do email |
| **Histórico de sessão** | Mantém todos os resultados da sessão na sidebar |
| **Deletar análises** | Remove resultados individuais ou em batch da sessão |
| **NLP stats** | Exibe redução de tokens após pré-processamento |
| **Login** | Sistema de autenticação com perfis de usuário |

---

## 🛠️ Stack Técnico

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Backend | FastAPI | 0.115+ |
| NLP | NLTK + RSLP Stemmer | 3.9+ |
| PDF | pypdf | 4.3+ |
| AI | Anthropic Claude claude-opus-4-5 | API |
| Email (IMAP) | imaplib (stdlib Python) | — |
| Frontend | React + Vite | 18 + 5 |
| Deploy Backend | Render | Free tier |
| Deploy Frontend | Vercel | Free tier |

---

## 📬 Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/health` | Health check |
| POST | `/analyze/text` | Analisa texto de email |
| POST | `/analyze/file` | Analisa arquivo .txt ou .pdf |
| POST | `/analyze/batch` | Analisa múltiplos arquivos (máx 20) |
| POST | `/gmail/fetch-and-analyze` | Busca e analisa emails do Gmail (máx 10) |

---

<a name="english"></a>

# 🇺🇸 English

Intelligent corporate email triage solution with AI-powered classification and automatic response generation (Claude claude-opus-4-5), Python NLP pipeline, native Gmail integration, authentication system, and premium web interface.

## 🔗 Links

- **Live App:** `[deploy URL — fill after deploy]`
- **Repository:** `[GitHub URL — fill after push]`

---

## 🏗️ Repository Structure

```
email-classifier/
├── README.md
├── backend/
│   ├── main.py              # FastAPI — endpoints, NLP, Claude & Gmail integration
│   ├── requirements.txt     # Python dependencies
│   ├── render.yaml          # Render deploy config
│   └── .env.example         # Required environment variables
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Auth router
│   │   ├── index.css        # Design system (variables, animations)
│   │   ├── main.jsx         # React entry point
│   │   └── components/
│   │       ├── LoginPage.jsx  # Login screen with animated split layout
│   │       └── MainApp.jsx    # Main classifier app with all analysis modes
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
└── sample_emails/
    ├── produtivo_urgente.txt
    └── improdutivo_agradecimento.txt
```

---

## ⚙️ Running Locally

### Prerequisites

- Python 3.10+
- Node.js 18+
- Anthropic API key (get one at console.anthropic.com)

### 1. Backend (FastAPI)

```bash
cd backend

python3 -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate

pip install -r requirements.txt

python -c "import nltk; nltk.download('stopwords'); nltk.download('rslp')"

cp .env.example .env
# Open .env and insert your ANTHROPIC_API_KEY

uvicorn main:app --reload --port 8000
```

API available at: `http://localhost:8000`
Auto-generated docs (Swagger): `http://localhost:8000/docs`

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

App available at: `http://localhost:5173`

### Demo Credentials

| Email | Password | Role |
|-------|----------|------|
| demo@autou.com.br | autou2025 | Financial Analyst |
| admin@autou.com.br | admin123 | Operations Manager |

---

## 🚀 Production Deploy

### Backend → Render (free)

1. Create account at render.com
2. New Web Service → connect GitHub repository
3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt && python -c "import nltk; nltk.download('stopwords'); nltk.download('rslp')"`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Under **Environment Variables**, add: `ANTHROPIC_API_KEY = your_key_here`
5. Deploy → copy the generated URL

### Frontend → Vercel

```bash
cd frontend
npm install -g vercel
vercel --prod
```

Set the environment variable: `VITE_API_URL` = your Render backend URL

---

## 🧠 How It Works

### Claude (Anthropic) Integration

The intelligence core of MailSense is Anthropic's Claude claude-opus-4-5 API. After NLP preprocessing, the email text is sent to the model with a structured system prompt defining classification criteria for the corporate financial context.

The model returns a structured JSON with:
- `classification` — PRODUCTIVE or UNPRODUCTIVE
- `confidence` — dynamic score from 0.0 to 1.0 (varies per email)
- `reason` — objective justification in 1-2 sentences
- `priority` — HIGH, MEDIUM, or LOW
- `key_topics` — topics identified in the content
- `suggested_subject` — suggested reply subject line
- `suggested_response` — full automatic reply in PT-BR

Classification and response generation happen in a single API call, keeping credit usage low (avg. $0.001 per email).

### Gmail Integration (IMAP)

The Gmail integration uses IMAP over SSL (port 993) with App Password authentication — a 16-character token generated specifically for applications, without exposing the main account password.

**Prerequisite:** Two-factor authentication enabled on the Google account.

**How to generate an App Password:**
1. Go to myaccount.google.com → Security
2. Enable "2-Step Verification" (required)
3. Go directly to: myaccount.google.com/apppasswords
4. Create a password named "MailSense" and copy the 16 characters

The system fetches the N most recent inbox emails, extracts sender, subject, date and body, and classifies each one individually. Maximum limit is 10 emails per request for API credit control.

### NLP Pipeline

```
Raw text
    ↓
Lowercase + special character removal (regex)
    ↓
Stopword removal PT + EN (NLTK)
    ↓
Stemming with RSLP algorithm (Portuguese-specific)
    ↓
Processed + original text → Claude claude-opus-4-5
    ↓
Structured JSON: classification, confidence, response
```

The RSLP algorithm (Portuguese Suffix Stripping) was developed specifically for Portuguese and outperforms the generic Porter Stemmer on Brazilian corporate texts, reducing vocabulary by 55-65% on average without significant semantic loss.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Free text** | Paste email content directly into the interface |
| **Single upload** | .txt or .pdf file (max 5MB) |
| **Batch (multiple)** | Up to 20 simultaneous files with aggregated summary |
| **Gmail** | Connects via IMAP and analyzes the last 5 or 10 emails |
| **Confidence score** | Dynamic score generated by Claude per email |
| **Suggested response** | One-click copy, contextualized for financial sector |
| **Priority** | HIGH / MEDIUM / LOW assigned automatically |
| **Topics** | Automatic extraction of main email themes |
| **Session history** | Keeps all session results in the sidebar |
| **Delete analyses** | Remove individual or batch results from the session |
| **NLP stats** | Shows token reduction after preprocessing |
| **Login** | Authentication system with user profiles |

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Backend | FastAPI | 0.115+ |
| NLP | NLTK + RSLP Stemmer | 3.9+ |
| PDF | pypdf | 4.3+ |
| AI | Anthropic Claude claude-opus-4-5 | API |
| Email (IMAP) | imaplib (Python stdlib) | — |
| Frontend | React + Vite | 18 + 5 |
| Backend Deploy | Render | Free tier |
| Frontend Deploy | Vercel | Free tier |

---

## 📬 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/analyze/text` | Analyze email text |
| POST | `/analyze/file` | Analyze .txt or .pdf file |
| POST | `/analyze/batch` | Analyze multiple files (max 20) |
| POST | `/gmail/fetch-and-analyze` | Fetch and analyze Gmail emails (max 10) |

### Example — Text

```bash
curl -X POST http://localhost:8000/analyze/text \
  -H "Content-Type: application/json" \
  -d '{"text": "Dear team, ticket #4521 has been open for 3 days with no response."}'
```

### Example — Gmail

```bash
curl -X POST http://localhost:8000/gmail/fetch-and-analyze \
  -H "Content-Type: application/json" \
  -d '{"email": "your@gmail.com", "app_password": "xxxx xxxx xxxx xxxx", "limit": 10}'
```

### Example Response

```json
{
  "success": true,
  "data": {
    "classification": "PRODUTIVO",
    "confidence": 0.97,
    "reason": "Request for ticket update with no response requires immediate action.",
    "priority": "ALTA",
    "key_topics": ["ticket", "support", "deadline"],
    "suggested_subject": "Re: Ticket #4521 Update",
    "suggested_response": "Dear customer,\n\nWe acknowledge receipt of your message...",
    "original_length": 94,
    "processed_length": 41
  }
}
```

---

## 📧 Sample Emails for Testing

Sample files are in the `sample_emails/` folder.

**Productive:**
```
Dear team, please find attached the Q3 report requested in our last meeting.
Please confirm receipt and return with approval by Friday to meet the
regulatory deadline.
```

**Unproductive:**
```
Hi everyone! Merry Christmas and Happy New Year!
Wishing you all a wonderful 2025. Best regards, Maria.
```