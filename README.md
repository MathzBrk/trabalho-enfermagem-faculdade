# Univas Enfermagem - Sistema de Gestão de Vacinação Corporativa

Sistema completo para gerenciamento de vacinação de funcionários em ambientes corporativos (hospitais, clínicas, empresas com programas internos de vacinação).

## 📋 Visão Geral

O **Univas Enfermagem** é uma solução moderna e completa que permite:

- Gestão de usuários com controle de acesso baseado em roles (FUNCIONÁRIO, ENFERMEIRO, GESTOR)
- Catálogo de vacinas e gerenciamento de lotes
- Agendamento e aplicação de vacinas
- Sistema de notificações para lembretes e alertas
- Relatórios e analytics para gestores
- Rastreamento completo do histórico de vacinação

## 🏗️ Arquitetura do Projeto (Monorepo)

```
univas-enfermagem/
├── app/
│   ├── api/          # Backend - API REST (Node.js + Express + TypeScript)
│   └── web/          # Frontend - Interface Web (React + TypeScript + Vite)
├── .gitignore
├── README.md
└── LICENSE
```

## 🚀 Tecnologias

### Backend ([app/api](./app/api))
- **Node.js** + **Express** - Runtime e framework web
- **TypeScript** - Tipagem estática
- **Prisma ORM** - Gerenciamento de banco de dados
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação e autorização
- **Zod** - Validação de schemas
- **tsyringe** - Injeção de dependências
- **Docker** - Containerização

### Frontend ([app/web](./app/web))
- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **React Router v7** - Roteamento
- **Zustand** - Gerenciamento de estado
- **Tailwind CSS v4** - Estilização
- **React Hook Form** + **Zod** - Formulários e validação
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones

## 📦 Setup e Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Docker (recomendado para o banco de dados PostgreSQL)

### 2️⃣ Backend Setup

```bash
cd app/api

# Instalar todas as dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# O .env.example já vem com as configurações padrão, não precisa editar

# Subir o banco de dados PostgreSQL via Docker
docker compose up -d

# Aguarde alguns segundos para o banco iniciar, depois execute:

# Gerar o Prisma Client (IMPORTANTE!)
npm run prisma:generate

# Executar as migrations do banco de dados
npm run prisma:migrate

# Popular o banco com dados de exemplo (usuários, vacinas, etc.)
npm run prisma:seed

# Iniciar o servidor de desenvolvimento
npm run dev
```

O backend estará disponível em `http://localhost:3000`

### 3️⃣ Frontend Setup (em outro terminal)

```bash
# A partir da raiz do projeto
cd app/web

# Instalar todas as dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# O .env.example já vem configurado: VITE_API_URL=http://localhost:3000/api

# Iniciar o servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

### 4️⃣ Acessar o Sistema

Abra o navegador em `http://localhost:5173` e faça login com uma das credenciais de teste (veja seção "🧪 Credenciais de Teste" abaixo).

---

### 📝 Resumo dos Comandos (Copie e Cole)

**Backend:**
```bash
cd app/api
npm install
cp .env.example .env
docker-compose up -d
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

**Frontend (em outro terminal):**
```bash
cd app/web
npm install
cp .env.example .env
npm run dev
```

---

## 👥 Roles e Permissões

O sistema possui três níveis de acesso:

### 🧑‍💼 EMPLOYEE (Funcionário)
- Visualizar suas próprias vacinas e agendamentos
- Receber notificações de doses
- Acessar histórico de vacinação
- Atualizar informações pessoais

### 💉 NURSE (Enfermeiro)
- Todas as permissões de EMPLOYEE
- Visualizar agendamentos do dia
- Registrar aplicação de vacinas
- Gerenciar lotes de vacinas
- Acessar informações de pacientes

### 👨‍💼 MANAGER (Gestor)
- Todas as permissões de NURSE
- Gerenciar usuários do sistema
- Gerenciar catálogo de vacinas
- Visualizar relatórios e analytics
- Configurar alertas do sistema

## 🧪 Credenciais de Teste (Ambiente de Desenvolvimento)

O sistema vem com dados mockados para desenvolvimento do frontend:

```
Funcionário:
  Email: funcionario1@hospital.com
  Senha: senha123

Enfermeiro:
  Email: enfermeira3@hospital.com
  Senha: senha123

Gestor:
  Email: admin@hospital.com
  Senha: senha123
```

## 🎨 Design System

O sistema utiliza uma paleta de cores profissional adequada para o contexto hospitalar:

- **Primária**: Medical Blue (#0066CC)
- **Secundária**: Light Blue (#E8F4F8)
- **Accent**: Bright Blue (#00A3E0)
- **Success**: Medical Green (#00AA55)
- **Background**: White (#FFFFFF)
- **Text**: Dark Gray (#1A1A1A)

## 🏃 Scripts Úteis

### Backend (app/api)
```bash
npm run start:dev      # Desenvolvimento com hot reload
npm run build          # Build de produção
npm run start          # Executar build de produção
npm run test           # Executar testes
npm run lint           # Lint e formatação (Biome)
npm run prisma:studio  # Interface visual do banco
```

### Frontend (app/web)
```bash
npm run dev            # Desenvolvimento com hot reload
npm run build          # Build de produção
npm run preview        # Preview do build
npm run lint           # Lint (ESLint)
```

## 📁 Estrutura de Pastas

### Backend (Clean Architecture)
```
app/api/src/
├── @types/              # Definições de tipos customizadas
├── infrastructure/      # Camada de infraestrutura
│   ├── http/           # Configuração Express
│   ├── routes/         # Rotas da API
│   ├── di/             # Injeção de dependências
│   └── database/       # Prisma e migrações
├── modules/            # Módulos de domínio
│   ├── user/
│   ├── vaccines/
│   ├── vaccines-batch/
│   ├── vaccine-application/
│   ├── vaccine-scheduling/
│   └── notifications/
└── shared/             # Código compartilhado
    ├── constants/
    ├── validators/
    ├── models/
    ├── stores/
    ├── helpers/
    └── middlewares/
```

### Frontend (Feature-based)
```
app/web/src/
├── components/
│   ├── ui/             # Componentes reutilizáveis
│   └── layout/         # Componentes de layout
├── pages/              # Páginas da aplicação
│   ├── Login/
│   └── Dashboard/
├── services/           # Serviços de API
├── store/              # Estado global (Zustand)
├── hooks/              # Custom hooks
├── types/              # Tipos TypeScript
├── utils/              # Utilitários
└── routes/             # Configuração de rotas
```

## 🔌 API Endpoints Principais

```
POST   /api/auth/login              # Autenticação
POST   /api/auth/register           # Registro

GET    /api/users                   # Listar usuários
GET    /api/users/:id               # Buscar usuário
POST   /api/users                   # Criar usuário
PUT    /api/users/:id               # Atualizar usuário
DELETE /api/users/:id               # Deletar usuário

GET    /api/vaccines                # Listar vacinas
GET    /api/vaccine-batches         # Listar lotes
GET    /api/vaccine-schedulings     # Listar agendamentos
GET    /api/vaccine-applications    # Listar aplicações
GET    /api/notifications           # Listar notificações
```

📚 **Documentação completa da API**: [app/api/docs/](./app/api/docs/)

## 🔒 Segurança

- Autenticação JWT com tokens seguros
- Senhas criptografadas com bcrypt
- Validação de input com Zod
- Headers de segurança (Helmet.js)
- CORS configurado
- Rate limiting
- SQL Injection protection (Prisma ORM)
- XSS protection

## 🧪 Testes

```bash
# Backend
cd app/api
npm run test

# Frontend (quando implementado)
cd app/web
npm run test
```

## 🐳 Docker

O backend pode ser executado completamente via Docker:

```bash
cd app/api

# Apenas banco de dados
docker-compose up -d postgres

# Aplicação completa (descomente no docker-compose.yml)
docker-compose up -d
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feat/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'feat: Add amazing feature'`)
4. Push para a branch (`git push origin feat/amazing-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

## 📞 Suporte

Para questões e suporte:
- Abra uma issue no GitHub
- Entre em contato com a equipe de desenvolvimento

---

**Desenvolvido com ❤️ para a área da saúde**
