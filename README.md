# MailSense — AutoU Email Classifier

Solução de triagem inteligente de emails corporativos com classificação e geração de respostas automáticas via IA (Claude claude-opus-4-5), pipeline NLP em Python, integração nativa com Gmail, sistema de autenticação e interface web premium.

## 🔗 Links

- **App Online:** `[URL do deploy — preencher após deploy]`
- **Repositório:** `https://github.com/yamatadev/email-classifier`

---

## 🏗️ Estrutura do Repositório

```
autou-email-classifier/
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

---

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

---

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

App disponível em: `http://localhost:5173`

---

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

Quando solicitado, configure: `VITE_API_URL` = URL do backend no Render

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

A classificação e a resposta são geradas em uma única chamada à API, mantendo o consumo de créditos baixo (média de $0,001 por email).

### Integração com Gmail (IMAP)

A integração Gmail utiliza o protocolo IMAP via SSL (porta 993) com autenticação por App Password — um token de 16 caracteres gerado especificamente para aplicações, sem expor a senha principal da conta.

**Pré-requisito:** Verificação em duas etapas ativa na conta Google.

**Como gerar o App Password:**
1. Acesse myaccount.google.com → Segurança
2. Ative "Verificação em duas etapas" (obrigatório)
3. Volte em Segurança e role para baixo
4. Clique em "Senhas de app" (ou acesse diretamente: myaccount.google.com/apppasswords)
5. Crie uma senha com nome "MailSense" e copie os 16 caracteres

O sistema busca os N emails mais recentes da caixa de entrada, extrai remetente, assunto, data e corpo, e classifica cada um individualmente. O limite máximo é 10 emails por requisição para controle de consumo da API.

### Pipeline NLP Completo

```
Texto bruto
    ↓
Lowercase + remoção de caracteres especiais (regex)
    ↓
Remoção de stopwords PT + EN (NLTK)
    ↓
Stemming com algoritmo RSLP (específico para português)
    ↓
Texto processado + texto original → Claude claude-opus-4-5
    ↓
JSON estruturado com classificação, confiança, resposta
```

O algoritmo RSLP (Removedor de Sufixos da Língua Portuguesa) foi desenvolvido especificamente para o português e produz resultados superiores ao Porter Stemmer genérico em textos corporativos brasileiros, reduzindo em média 55-65% o vocabulário sem perda semântica relevante.

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
| **NLP stats** | Exibe redução de tokens após pré-processamento |
| **Login** | Sistema de autenticação com perfis de usuário |

---

## 🛠️ Stack Técnico

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Backend | FastAPI | 0.115 |
| NLP | NLTK + RSLP Stemmer | 3.9.1 |
| PDF | pypdf | 4.3.1 |
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

### Exemplo — Texto

```bash
curl -X POST http://localhost:8000/analyze/text \
  -H "Content-Type: application/json" \
  -d '{"text": "Prezados, o chamado #4521 segue sem retorno há 3 dias."}'
```

### Exemplo — Gmail

```bash
curl -X POST http://localhost:8000/gmail/fetch-and-analyze \
  -H "Content-Type: application/json" \
  -d '{"email": "seu@gmail.com", "app_password": "xxxx xxxx xxxx xxxx", "limit": 10}'
```

### Exemplo de Response

```json
{
  "success": true,
  "data": {
    "classification": "PRODUTIVO",
    "confidence": 0.97,
    "reason": "Solicitação de atualização sobre chamado sem resposta requer ação imediata.",
    "priority": "ALTA",
    "key_topics": ["chamado", "suporte", "prazo"],
    "suggested_subject": "Re: Atualização Chamado #4521",
    "suggested_response": "Prezado(a),\n\nAcusamos o recebimento...",
    "original_length": 94,
    "processed_length": 41
  }
}
```

---

## 📧 Emails de Exemplo para Teste

Os arquivos estão na pasta `sample_emails/` do repositório.

**Produtivo:**
```
Prezados, segue em anexo o relatório Q3 solicitado. Por favor confirmar
o recebimento e retornar com aprovação até sexta-feira para cumprirmos
o prazo regulatório.
```

**Improdutivo:**
```
Olá equipe! Feliz Natal e um próspero Ano Novo a todos!
Que 2025 traga muitas realizações. Um grande abraço.
```