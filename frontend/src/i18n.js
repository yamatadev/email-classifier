export const translations = {
  'pt-BR': {
    // Login Page
    login: {
      tagline: 'by YamatDev · AI Email Classifier',
      headline1: 'Triagem de emails',
      headline2: 'inteligente',
      description: 'Classifique, priorize e responda emails corporativos automaticamente com inteligência artificial.',
      features: [
        'Classificação inteligente em tempo real',
        'Sugestão automática de respostas',
        'Pipeline NLP com RSLP para português',
        'Histórico e métricas por sessão',
      ],
      stats: [
        { value: '150k+', label: 'Pessoas impactadas' },
        { value: 'US$10M+', label: 'Em ganhos gerados' },
        { value: '15+', label: 'Países atendidos' },
      ],
      welcomeBack: 'Bem-vindo de volta',
      accessAccount: 'Acesse sua conta para continuar',
      demoAccess: 'Acesso demo',
      demoHint: 'demo@autou.com.br · autou2025',
      emailLabel: 'EMAIL',
      emailPlaceholder: 'seu@email.com.br',
      passwordLabel: 'SENHA',
      passwordPlaceholder: '••••••••',
      errorEmpty: 'Preencha todos os campos.',
      errorInvalid: 'Email ou senha incorretos. Tente: demo@autou.com.br / autou2025',
      verifying: 'Verificando...',
      enter: 'Entrar',
      footer: 'MailSense · YamataDev © 2025',
      langButton: '🇺🇸 Switch to English',
      langHint: 'Clique para mudar o idioma',
    },

    // Main App — Header
    header: {
      tagline: 'by YamataDev',
      analyzed: 'Analisados',
      avgConfidence: 'Confiança avg',
      online: 'Online',
      logout: 'Sair',
    },

    // Tabs
    tabs: {
      text: 'Texto',
      file: 'Arquivo',
      batch: 'Múltiplos',
      gmail: 'Gmail',
    },

    // Input Area
    input: {
      textPlaceholder: 'Cole aqui o conteúdo do email para análise...',
      chars: 'chars',
      dragFiles: 'Arraste os arquivos ou',
      dragFile: 'Arraste um arquivo ou',
      clickSelect: 'clique para selecionar',
      fileHintMultiple: '.TXT · .PDF · máx 5MB · até 20 arquivos',
      fileHintSingle: '.TXT · .PDF · máx 5MB',
      filesSelected: 'arquivo(s) selecionado(s)',
      clear: 'Limpar',
      clearAll: 'Limpar',
      analyze: 'Analisar Email',
      analyzeBatch: 'Analisar',
      analyzing: 'Analisando...',
      files: 'arquivo(s)',
    },

    // Gmail Tab
    gmail: {
      guideTitle: 'Como obter o App Password do Gmail?',
      guideSteps: [
        'Acesse myaccount.google.com → Segurança',
        'Clique em "Verificação em duas etapas" e ATIVE (obrigatório)',
        'Após ativar, volte em Segurança e role para baixo',
        'Clique em "Senhas de app" (só aparece com 2FA ativo)',
        'Digite um nome como "MailSense" e clique em Criar',
        'Copie a senha de 16 caracteres gerada',
      ],
      emailLabel: 'EMAIL GMAIL',
      emailPlaceholder: 'seu@gmail.com',
      passwordLabel: 'APP PASSWORD',
      passwordPlaceholder: 'xxxx xxxx xxxx xxxx',
      quantityLabel: 'QUANTIDADE DE EMAILS',
      limitHint: 'Limitado a 10 para controle de créditos da API.',
      fetchButton: 'Buscar e Analisar Gmail',
      fetching: 'Buscando e analisando...',
      errorEmpty: 'Preencha email e App Password.',
    },

    // Results
    results: {
      confidence: 'Confiança',
      reason: 'Justificativa',
      topics: 'Tópicos Identificados',
      suggestedResponse: 'Resposta Sugerida',
      copy: 'Copiar',
      copied: 'Copiado',
      originalChars: 'chars originais',
      afterNlp: 'após NLP',
      reduction: 'redução',
      productive: 'Produtivo',
      unproductive: 'Improdutivo',
      high: 'Alta',
      medium: 'Média',
      low: 'Baixa',
    },

    // Batch Summary
    batch: {
      total: 'Total',
      productive: 'Produtivos',
      unproductive: 'Improdutivos',
      avgConfidence: 'Confiança avg',
      errors: 'Erros',
      allRemoved: 'Todos os emails foram removidos.',
    },

    // History
    history: {
      title: 'Histórico',
      empty: 'Nenhuma análise ainda',
      emails: 'emails',
    },

    // Empty State
    emptyState: {
      title: 'Pronto para analisar',
      subtitle: 'Texto · Arquivo · Múltiplos arquivos · Gmail',
    },

    // Right Panel
    panel: {
      categories: 'Categorias',
      productiveDesc: 'Requer ação ou resposta',
      unproductiveDesc: 'Não requer ação imediata',
      pipeline: 'Pipeline NLP',
      pipelineSteps: ['Tokenização', 'Stopwords (PT+EN)', 'Stemming RSLP', 'Claude AI', 'Resposta gerada'],
      modes: 'Modos',
      modesList: ['Texto livre', 'Arquivo único', 'Múltiplos (20x)', 'Gmail (10x)'],
      stack: 'Stack',
    },
  },

  'en-US': {
    // Login Page
    login: {
      tagline: 'by YamataDev · AI Email Classifier',
      headline1: 'Intelligent email',
      headline2: 'triage',
      description: 'Automatically classify, prioritize and reply to corporate emails using artificial intelligence.',
      features: [
        'Real-time intelligent classification',
        'Automatic response suggestions',
        'NLP pipeline with RSLP for Portuguese',
        'Session history and metrics',
      ],
      stats: [
        { value: '150k+', label: 'People impacted' },
        { value: 'US$10M+', label: 'In gains generated' },
        { value: '15+', label: 'Countries served' },
      ],
      welcomeBack: 'Welcome back',
      accessAccount: 'Sign in to your account to continue',
      demoAccess: 'Demo access',
      demoHint: 'demo@autou.com.br · autou2025',
      emailLabel: 'EMAIL',
      emailPlaceholder: 'your@email.com',
      passwordLabel: 'PASSWORD',
      passwordPlaceholder: '••••••••',
      errorEmpty: 'Please fill in all fields.',
      errorInvalid: 'Invalid email or password. Try: demo@autou.com.br / autou2025',
      verifying: 'Verifying...',
      enter: 'Sign In',
      footer: 'MailSense · YamataDev © 2025',
      langButton: '🇧🇷 Mudar para Português',
      langHint: 'Click to change language',
    },

    // Main App — Header
    header: {
      tagline: 'by YamataDev',
      analyzed: 'Analyzed',
      avgConfidence: 'Avg confidence',
      online: 'Online',
      logout: 'Sign out',
    },

    // Tabs
    tabs: {
      text: 'Text',
      file: 'File',
      batch: 'Multiple',
      gmail: 'Gmail',
    },

    // Input Area
    input: {
      textPlaceholder: 'Paste the email content here for analysis...',
      chars: 'chars',
      dragFiles: 'Drag files or',
      dragFile: 'Drag a file or',
      clickSelect: 'click to select',
      fileHintMultiple: '.TXT · .PDF · max 5MB · up to 20 files',
      fileHintSingle: '.TXT · .PDF · max 5MB',
      filesSelected: 'file(s) selected',
      clear: 'Clear',
      clearAll: 'Clear all',
      analyze: 'Analyze Email',
      analyzeBatch: 'Analyze',
      analyzing: 'Analyzing...',
      files: 'file(s)',
    },

    // Gmail Tab
    gmail: {
      guideTitle: 'How to get your Gmail App Password?',
      guideSteps: [
        'Go to myaccount.google.com → Security',
        'Click "2-Step Verification" and ENABLE it (required)',
        'After enabling, go back to Security and scroll down',
        'Click "App passwords" (only appears with 2FA active)',
        'Enter a name like "MailSense" and click Create',
        'Copy the generated 16-character password',
      ],
      emailLabel: 'GMAIL EMAIL',
      emailPlaceholder: 'your@gmail.com',
      passwordLabel: 'APP PASSWORD',
      passwordPlaceholder: 'xxxx xxxx xxxx xxxx',
      quantityLabel: 'NUMBER OF EMAILS',
      limitHint: 'Limited to 10 to control API credit usage.',
      fetchButton: 'Fetch and Analyze Gmail',
      fetching: 'Fetching and analyzing...',
      errorEmpty: 'Please fill in email and App Password.',
    },

    // Results
    results: {
      confidence: 'Confidence',
      reason: 'Reasoning',
      topics: 'Identified Topics',
      suggestedResponse: 'Suggested Response',
      copy: 'Copy',
      copied: 'Copied',
      originalChars: 'original chars',
      afterNlp: 'after NLP',
      reduction: 'reduction',
      productive: 'Productive',
      unproductive: 'Unproductive',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    },

    // Batch Summary
    batch: {
      total: 'Total',
      productive: 'Productive',
      unproductive: 'Unproductive',
      avgConfidence: 'Avg confidence',
      errors: 'Errors',
      allRemoved: 'All emails have been removed.',
    },

    // History
    history: {
      title: 'History',
      empty: 'No analyses yet',
      emails: 'emails',
    },

    // Empty State
    emptyState: {
      title: 'Ready to analyze',
      subtitle: 'Text · File · Multiple files · Gmail',
    },

    // Right Panel
    panel: {
      categories: 'Categories',
      productiveDesc: 'Requires action or response',
      unproductiveDesc: 'No immediate action needed',
      pipeline: 'NLP Pipeline',
      pipelineSteps: ['Tokenization', 'Stopwords (PT+EN)', 'RSLP Stemming', 'Claude AI', 'Response generated'],
      modes: 'Modes',
      modesList: ['Free text', 'Single file', 'Multiple (20x)', 'Gmail (10x)'],
      stack: 'Stack',
    },
  },
}
