# Promo Plan

<div align="center">

**Sistema de gestão para promotora de eventos de degustações em supermercados**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Latest-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-cyan?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

[Reportar Bug](https://github.com/leandroaquinopereira/promo-plan/issues) • [Solicitar Feature](https://github.com/leandroaquinopereira/promo-plan/issues)

</div>

## 📖 Sobre o Projeto

O **Promo Plan** é um sistema completo de gestão para empresas promotoras que realizam degustações em supermercados. A plataforma centraliza todo o processo de gerenciamento de eventos promocionais, substituindo a gestão manual via WhatsApp por uma solução digital robusta e automatizada.

### 🎯 Problema Resolvido

A cliente, uma promotora de eventos, gerenciava manualmente cerca de **20-30 degustações por fim de semana** na região sul de Minas Gerais, coordenando freelancers através do WhatsApp. O processo envolvia:

**Processo Atual Manual:**
- **Sexta-feira**: Freelancer inicia processo no supermercado
- **Montagem**: Checklist de entrada com montagem da bancada 
- **Evidências**: Registros fotográficos obrigatórios com localização, data e hora
- **Acompanhamento**: Checklists diários de entrada e saída
- **Desmontagem**: Checklist final no domingo com desmontagem
- **Relatórios**: Compilação manual de dados para fornecedores

**Problemas Identificados:**
- ❌ Checklists dispersos no WhatsApp
- ❌ Evidências fotográficas desorganizadas
- ❌ Relatórios criados manualmente
- ❌ Dificuldade no acompanhamento em tempo real
- ❌ Falta de centralização de dados

### ✨ Solução Oferecida

Uma plataforma web que automatiza e centraliza:
- ✅ **Gestão de Freelancers** - Cadastro e acompanhamento
- ✅ **Checklists Digitais** - Com evidências fotográficas obrigatórias
- ✅ **Relatórios Automáticos** - Geração instantânea para fornecedores
- ✅ **Acompanhamento em Tempo Real** - Dashboard com status das degustações
- ✅ **Sistema de Guias** - Documentação e treinamento integrados

## 🚀 Funcionalidades Implementadas

### 📋 Dashboard Administrativo
- **Visão Geral**: Métricas em tempo real de degustações ativas
- **Cards Informativos**: Resumo visual das principais atividades
- **Ações Rápidas**: Acesso direto às funcionalidades mais utilizadas
- **Sistema de Notificações**: Alertas para eventos importantes

### 📚 Sistema Completo de Guias
O sistema de guias é o coração da documentação e treinamento da plataforma:

#### 🗂️ Categorização Inteligente
- **Checklists**: Guias para procedimentos padronizados
- **Evidências Fotográficas**: Orientações para documentação visual
- **Relatórios**: Templates e instruções para geração automática
- **Treinamento**: Material educativo para freelancers
- **Processos**: Fluxos de trabalho detalhados

#### 🖊️ Editor de Texto Avançado (TipTap)
- **Formatação Rica**: Negrito, itálico, sublinhado, riscado
- **Blocos Especializados**: 
  - Códigos com syntax highlighting (HTML, CSS, JS, TS)
  - Citações e callouts
  - Listas numeradas e com marcadores
  - Tarefas com checkboxes
- **Menu Slash (/)**: Inserção rápida de elementos
- **Barra Flutuante**: Formatação contextual
- **Drag & Drop**: Upload de imagens por arrastar e soltar

#### 📁 Sistema de Upload de Imagens
- **Firebase Storage**: Integração nativa para armazenamento
- **Progress Bar**: Indicador de progresso em tempo real
- **Blur Loading**: Carregamento suave com efeito placeholder
- **Otimização Next.js**: Componente Image otimizado
- **Múltiplos Formatos**: Suporte a PNG, JPG, WebP

#### 🔍 Funcionalidades de Gestão
- **Busca Avançada**: Localização rápida por título e conteúdo
- **Timestamps**: Controle de criação e edição
- **Auto-save**: Salvamento automático durante edição
- **Títulos Editáveis**: Edição inline de títulos de guias

### 🔐 Sistema de Autenticação Robusto
- **NextAuth.js**: Framework de autenticação enterprise
- **Múltiplos Provedores**: Preparado para Google, GitHub, etc.
- **Verificação SMS**: Sistema integrado com AWS SNS
- **Recuperação de Senha**: Fluxo completo de reset
- **Sessões Seguras**: JWT com cookies HttpOnly
- **Middleware de Proteção**: Rotas automáticamente protegidas

#### 📱 Fluxo de Autenticação por SMS
- **Verificação por Telefone**: Sistema de código via SMS
- **Formatação Inteligente**: Input com máscara brasileira
- **Reenvio de Código**: Funcionalidade de reenvio
- **Validação em Tempo Real**: Feedback instantâneo
- **Tratamento de Erros**: Mensagens específicas por tipo de erro

### 🎨 Interface e Experiência do Usuário
- **Design System**: Componentes baseados em Radix UI
- **Tema Escuro/Claro**: Alternância com persistência
- **Responsividade**: Mobile-first design
- **Animações**: Framer Motion para microinterações
- **Acessibilidade**: Padrões WCAG implementados
- **Toast Notifications**: Sistema de feedback (Sonner)

### ⚡ Performance e Otimização
- **Next.js 15**: App Router com Server Components
- **Image Optimization**: Lazy loading e WebP automático
- **Code Splitting**: Carregamento otimizado por rota
- **Bundle Analysis**: Monitoramento de tamanho
- **Caching Strategy**: Estratégias avançadas de cache

## 🛠️ Stack Tecnológica

### 🎯 Frontend
```typescript
Framework:       Next.js 15 (App Router, Server Components)
Linguagem:       TypeScript 5 (Strict Mode)
Estilização:     Tailwind CSS 3 + shadcn/ui
Animações:       Framer Motion
Validação:       Zod + React Hook Form
Editor:          TipTap (Extensível e customizável)
```

### 🔧 Backend & Infraestrutura
```typescript
Database:        Firebase Firestore (NoSQL)
Storage:         Firebase Storage (Imagens/Arquivos)
Authentication:  NextAuth.js + Firebase Admin
SMS Service:     AWS SNS (Verificação por telefone)
Server Actions:  Next.js (API routes modernizadas)
```

### 🎨 UI/UX & Editor
```typescript
Components:      Radix UI (Acessibilidade nativa)
Icons:           Lucide React (Biblioteca moderna)
Editor Engine:   TipTap (Baseado em ProseMirror)
Syntax Highlight: Highlight.js + Lowlight
Notifications:   Sonner (Toast messages)
Theme System:    next-themes (Persistência automática)
```

### 🔧 Ferramentas de Desenvolvimento
```typescript
Linting:         ESLint + Prettier (Formatação automática)
Type Safety:     TypeScript strict mode
Package Manager: pnpm (Performance otimizada)
Git Hooks:       Husky + lint-staged
Testing:         Preparado para Jest + Testing Library
```

## 📁 Arquitetura do Projeto

```
src/
├── app/                    # App Router (Next.js 15)
│   ├── globals.css        # Estilos globais e variáveis CSS
│   ├── layout.tsx         # Layout raiz da aplicação
│   ├── providers.tsx      # Providers globais (Theme, Auth, etc.)
│   │
│   ├── (dashboard)/       # Grupo de rotas protegidas
│   │   ├── layout.tsx     # Layout do dashboard
│   │   ├── page.tsx       # Página inicial do dashboard
│   │   ├── components/    # Componentes específicos do dashboard
│   │   │   ├── guide-list-item.tsx    # Item da lista de guias
│   │   │   ├── guide-section.tsx      # Seção de guias
│   │   │   ├── home-section.tsx       # Seção inicial
│   │   │   ├── info-section.tsx       # Seção informativa
│   │   │   └── quick-actions-section.tsx # Ações rápidas
│   │   │
│   │   └── guides/        # Sistema de guias
│   │       ├── page.tsx   # Lista de guias
│   │       └── [guideId]/ # Guia individual
│   │           ├── page.tsx
│   │           └── components/
│   │
│   ├── auth/              # Sistema de autenticação
│   │   ├── layout.tsx     # Layout das páginas de auth
│   │   ├── sign-in/       # Login
│   │   │   ├── form.tsx   # Formulário de login
│   │   │   └── page.tsx
│   │   └── forgot-password/ # Recuperação de senha
│   │       ├── form.tsx
│   │       ├── page.tsx
│   │       └── reset-password/
│   │
│   └── api/               # API Routes
│       └── auth/
│           └── [...nextauth]/ # Configuração NextAuth
│
├── components/            # Componentes reutilizáveis
│   ├── auth-provider.tsx  # Provider de autenticação
│   ├── header.tsx         # Cabeçalho da aplicação
│   ├── logout-button.tsx  # Botão de logout
│   ├── notifications.tsx  # Sistema de notificações
│   │
│   ├── editor/           # Sistema de editor avançado
│   │   ├── editor.tsx    # Componente principal do editor
│   │   ├── editable-title.tsx # Título editável
│   │   ├── bubble-button.tsx  # Botões da barra flutuante
│   │   ├── float-menu.tsx     # Menu flutuante
│   │   │
│   │   ├── blocks/       # Blocos customizados
│   │   │   ├── code.tsx  # Bloco de código
│   │   │   └── image.tsx # Bloco de imagem
│   │   │
│   │   └── extensions/   # Extensões do TipTap
│   │       ├── upload-image.tsx    # Extensão de upload
│   │       └── utils/
│   │           ├── file-handler.tsx # Manipulação de arquivos
│   │           └── uploader.ts      # Lógica de upload
│   │
│   ├── framer-motion/    # Componentes animados
│   │   └── motion-div.tsx
│   │
│   ├── theme/            # Sistema de temas
│   │   ├── provider.tsx  # Provider de tema
│   │   └── toggle.tsx    # Alternador de tema
│   │
│   └── ui/               # Componentes base (shadcn/ui)
│       ├── button.tsx    # Botões customizáveis
│       ├── card.tsx      # Cards e containers
│       ├── dialog.tsx    # Modais e diálogos
│       ├── form.tsx      # Formulários
│       ├── input.tsx     # Campos de entrada
│       ├── input-otp.tsx # Input para códigos OTP
│       ├── progress.tsx  # Barras de progresso
│       └── ... (mais 15+ componentes)
│
├── actions/              # Server Actions (Next.js)
│   ├── check-if-user-exists.ts     # Verificação de usuário
│   ├── confirm-sms-code.ts         # Confirmação SMS
│   ├── create-new-guide.ts         # Criação de guias
│   ├── delete-guide.ts             # Exclusão de guias
│   ├── resend-sms-confirmation.ts  # Reenvio de SMS
│   ├── save-guide-content.ts       # Salvamento de conteúdo
│   └── send-sms-confirmation.ts    # Envio de SMS
│
├── lib/                  # Utilitários e configurações
│   ├── utils.ts          # Utilitários gerais (cn, formatters)
│   ├── dayjs.ts          # Configuração de datas
│   ├── react-query.ts    # Configuração do React Query
│   │
│   ├── firebase/         # Configuração Firebase
│   │   ├── client.ts     # SDK do cliente
│   │   └── server.ts     # Admin SDK
│   │
│   └── next-auth/        # Configuração NextAuth
│       └── auth.ts       # Providers e callbacks
│
├── schemas/              # Schemas de validação (Zod)
│   └── server-action-output.ts
│
├── constants/            # Constantes da aplicação
│   ├── actions-success-codes.ts    # Códigos de sucesso
│   ├── aws-sns-error-code.ts       # Códigos de erro SMS
│   ├── default-tiptap-content.ts   # Conteúdo padrão
│   ├── firebase-error-code.ts      # Códigos de erro Firebase
│   ├── guide-category-color.ts     # Cores das categorias
│   └── guide-category-map.ts       # Mapeamento de categorias
│
├── utils/                # Utilitários específicos
│   ├── crypto.ts         # Funções de criptografia
│   ├── format-phone-number.ts      # Formatação de telefone
│   ├── format-username.ts          # Formatação de username
│   ├── generate-verification-code.ts # Geração de códigos
│   ├── generates-substrings-to-query-search.ts # Busca
│   ├── normalize-text.ts           # Normalização de texto
│   └── queries.ts                  # Queries do Firestore
│
└── @types/               # Definições de tipos TypeScript
    ├── firebase.d.ts     # Tipos do Firebase
    └── nextauth.d.ts     # Tipos do NextAuth
```

## ⚙️ Instalação e Configuração

### 1. Clone o Repositório
```bash
git clone https://github.com/leandroaquinopereira/promo-plan.git
cd promo-plan
```

### 2. Instale as Dependências
```bash
# Usando pnpm (recomendado)
pnpm install

# Ou usando npm
npm install

# Ou usando yarn
yarn install
```

### 3. Configuração das Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# NextAuth Configuration
NEXTAUTH_SECRET="seu-secret-super-secreto-aqui"
NEXTAUTH_URL="http://localhost:3000"

# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="sua-api-key-aqui"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="seu-projeto.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="seu-projeto-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="seu-projeto.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abcdef123456"

# Firebase Server Configuration (Service Account)
AUTH_FIREBASE_PROJECT_ID="seu-projeto-id"
AUTH_FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_PRIVATE_KEY_AQUI\n-----END PRIVATE KEY-----\n"
AUTH_FIREBASE_CLIENT_EMAIL="firebase-adminsdk@seu-projeto.iam.gserviceaccount.com"

# AWS SNS Configuration (Para SMS)
AWS_ACCESS_KEY_ID="sua-access-key-id"
AWS_SECRET_ACCESS_KEY="sua-secret-access-key"
AWS_REGION="us-east-1"
```

### 4. Configuração do Firebase

#### 4.1 Criação do Projeto
1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Criar projeto"
3. Siga as instruções de configuração

#### 4.2 Ativação dos Serviços
**Authentication:**
```bash
# Ative os seguintes provedores:
- Email/Password ✅
- SMS (para verificação) ✅
```

**Firestore Database:**
```javascript
// Regras de segurança recomendadas:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Coleção de guias
    match /guides/{guideId} {
      allow read, write: if request.auth != null;
    }
    
    // Coleção de usuários
    match /users/{userId} {
      allow read, write: if request.auth != null && 
                          request.auth.uid == userId;
    }
  }
}
```

**Storage:**
```javascript
// Regras de segurança para Storage:
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /guides/uploads/{fileName} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### 4.3 Service Account
1. Vá para **Configurações do Projeto** > **Contas de Serviço**
2. Clique em **Gerar nova chave privada**
3. Baixe o arquivo JSON
4. Extraia as informações para as variáveis de ambiente

### 5. Configuração do AWS SNS (Opcional - Para SMS)

1. **Crie uma conta na AWS**
2. **Acesse o console do SNS**
3. **Configure as credenciais IAM** com permissões para SNS
4. **Adicione as credenciais** nas variáveis de ambiente

### 6. Execute o Projeto

```bash
# Modo de desenvolvimento
pnpm dev

# Ou usando npm
npm run dev

# Ou usando yarn
yarn dev
```

O projeto estará disponível em **[http://localhost:3000](http://localhost:3000)**

### 7. Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Inicia o servidor de desenvolvimento
pnpm build            # Build para produção
pnpm start            # Inicia o servidor de produção
pnpm lint             # Executa o linter
pnpm lint:fix         # Corrige problemas do linter automaticamente
```

## 📈 Roadmap de Desenvolvimento

### 🎯 Fase 1: Gestão de Degustações (Em Desenvolvimento)
- [ ] **CRUD de Degustações** - Criação, edição e exclusão de eventos
- [ ] **Sistema de Agendamento** - Calendário integrado para planejamento
- [ ] **Gestão de Locais** - Cadastro de supermercados e localizações
- [ ] **Dashboard de Eventos** - Visão geral de degustações ativas/agendadas

### 🎯 Fase 2: Sistema de Freelancers
- [ ] **Cadastro de Freelancers** - Perfis completos com documentação
- [ ] **Sistema de Alocação** - Atribuição automática e manual
- [ ] **Controle de Disponibilidade** - Calendário pessoal dos freelancers
- [ ] **Histórico de Participações** - Rastreamento de performance

### 🎯 Fase 3: Checklists e Evidências
- [ ] **Checklists Dinâmicos** - Sistema configurável por tipo de evento
- [ ] **Captura de Evidências** - Upload com metadados automáticos (GPS, timestamp)
- [ ] **Validação em Tempo Real** - Verificação automática de completude
- [ ] **Galeria de Evidências** - Organização visual por evento

### 🎯 Fase 4: Relatórios Automáticos
- [ ] **Templates Personalizáveis** - Diferentes formatos por cliente/fornecedor
- [ ] **Geração em PDF** - Relatórios profissionais automatizados
- [ ] **Dashboard de Métricas** - KPIs e analytics avançados
- [ ] **Exportação de Dados** - Múltiplos formatos (Excel, CSV, JSON)

### 🎯 Fase 5: Mobile & Notificações
- [ ] **App React Native** - Aplicativo dedicado para freelancers
- [ ] **Push Notifications** - Alertas em tempo real
- [ ] **Modo Offline** - Sincronização quando conectar
- [ ] **QR Code Integration** - Check-in automático por localização

### 🎯 Fase 6: Analytics & IA
- [ ] **Business Intelligence** - Dashboards executivos
- [ ] **Previsão de Demanda** - ML para otimização de recursos
- [ ] **Análise de Performance** - Insights automáticos
- [ ] **Recomendações Inteligentes** - Sugestões baseadas em dados

## 🧪 Testes e Qualidade

### 📋 Estratégia de Testes (Planejado)
```typescript
// Configuração planejada para testes
Unit Tests:     Jest + Testing Library
E2E Tests:      Playwright
Integration:    Cypress
API Tests:      Supertest
Coverage:       Target 80%+
```

### 🔍 Qualidade de Código
```typescript
// Ferramentas já configuradas
Linting:        ESLint (strict rules)
Formatting:     Prettier (auto-format)
Type Safety:    TypeScript strict mode
Pre-commit:     Husky + lint-staged (planejado)
Code Review:    GitHub PR templates (planejado)
```

## 🚀 Deploy e Produção

### 🌐 Plataformas Recomendadas
```bash
# Opções de deploy
Frontend:       Vercel (recomendado) | Netlify
Database:       Firebase (já configurado)
Storage:        Firebase Storage (já configurado)
CDN:            Vercel Edge Network | Cloudflare
Monitoring:     Vercel Analytics | Sentry (planejado)
```

### 📊 Variáveis de Produção
```env
# Exemplo para produção
NEXTAUTH_URL="https://seu-dominio.com"
NODE_ENV="production"
# ... demais variáveis com valores de produção
```

## 🤝 Contribuição

### 📋 Como Contribuir
1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. **Commit** suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. **Push** para a branch (`git push origin feature/MinhaFeature`)
5. **Abra** um Pull Request

### 🎯 Guidelines de Desenvolvimento
```typescript
// Padrões de código
- Use TypeScript strict mode
- Siga as convenções do ESLint
- Componentes em PascalCase
- Funções em camelCase
- Constantes em SCREAMING_SNAKE_CASE
- Use Conventional Commits
```

### 🔧 Setup para Contribuidores
```bash
# Clone e configure
git clone https://github.com/leandroaquinopereira/promo-plan.git
cd promo-plan
pnpm install
cp .env.example .env.local
# Configure suas variáveis de ambiente
pnpm dev
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte e Contato

### 🚨 Reportar Problemas
- [Issues no GitHub](https://github.com/leandroaquinopereira/promo-plan/issues)
- Descreva o problema em detalhes
- Inclua screenshots se necessário
- Mencione a versão do navegador/OS

### 💬 Comunidade
- **GitHub Discussions** (em breve)
- **Discord Server** (planejado)

### 👨‍💻 Desenvolvedor Principal
**Leandro Aquino Pereira**
- 🌐 GitHub: [@leandroaquinopereira](https://github.com/leandroaquinopereira)
- 💼 LinkedIn: [leandroaquinopereira](https://linkedin.com/in/leandroaquinopereira)
- 📧 Email: leandroaquino.dev@gmail.com

---

<div align="center">

**🚀 Revolucionando a gestão de eventos promocionais com tecnologia moderna**

⭐ **Deixe uma estrela se este projeto te inspirou!**

🤝 **Contribuições são sempre bem-vindas**

📢 **Compartilhe com sua rede profissional**

</div>

