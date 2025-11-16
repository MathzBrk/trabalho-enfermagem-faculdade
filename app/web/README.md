# Univas Enfermagem - Frontend

Sistema de Gestão de Vacinação Corporativa desenvolvido com React + TypeScript + Vite.

## Tecnologias Utilizadas

- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **React Router v6** - Roteamento
- **Zustand** - Gerenciamento de estado
- **Axios** - Cliente HTTP
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones
- **date-fns** - Manipulação de datas

## Estrutura do Projeto

```
src/
├── components/
│   ├── ui/              # Componentes UI reutilizáveis
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── Modal.tsx
│   ├── layout/          # Componentes de layout
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── DashboardLayout.tsx
│   └── common/          # Componentes comuns
├── pages/
│   ├── Login/           # Página de login
│   └── Dashboard/       # Dashboards por role
│       ├── EmployeeDashboard.tsx
│       ├── NurseDashboard.tsx
│       └── ManagerDashboard.tsx
├── services/
│   ├── api.ts           # Configuração do Axios
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── vaccine.service.ts
│   └── notification.service.ts
├── store/
│   └── authStore.ts     # Store Zustand para autenticação
├── hooks/
│   ├── useAuth.ts       # Hook de autenticação
│   └── useApi.ts        # Hook para chamadas de API
├── types/
│   └── index.ts         # Tipos TypeScript
├── utils/
│   ├── cn.ts            # Utilitário de classes CSS
│   ├── formatters.ts    # Funções de formatação
│   └── mockData.ts      # Dados mock para desenvolvimento
├── routes/
│   ├── index.tsx        # Configuração de rotas
│   └── ProtectedRoute.tsx
├── App.tsx
├── main.tsx
└── index.css
```

## Configuração e Instalação

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Passos para Instalação

1. **Instalar dependências:**
   ```bash
   cd app/web
   npm install
   ```

2. **Configurar variáveis de ambiente:**
   ```bash
   cp .env.example .env
   ```

   Edite o arquivo `.env` conforme necessário:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```

3. **Iniciar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

   O aplicativo estará disponível em `http://localhost:5173`

4. **Build para produção:**
   ```bash
   npm run build
   ```

5. **Preview do build de produção:**
   ```bash
   npm run preview
   ```

## Funcionalidades Implementadas

### Autenticação
- Login com email e senha
- Validação de formulários com Zod
- Armazenamento de token JWT
- Auto-redirect para dashboard
- Logout

### Sistema de Rotas
- Rotas públicas (Login)
- Rotas protegidas (Dashboard, etc.)
- Proteção por role (Employee, Nurse, Manager)
- Redirect automático para login se não autenticado

### Dashboards por Role

#### Employee Dashboard
- Cards de estatísticas pessoais
- Próximo agendamento
- Histórico de vacinação
- Notificações não lidas

#### Nurse Dashboard
- Agendamentos do dia
- Próximos agendamentos
- Ações rápidas (Aplicar vacina, Ver agenda)
- Atividade recente

#### Manager Dashboard
- Visão geral do sistema
- Estatísticas globais (funcionários, vacinas, aplicações)
- Alertas (lotes vencendo, estoque baixo)
- Tabela de próximos agendamentos
- Atividade recente

### Componentes UI

Todos os componentes seguem um padrão consistente com:
- Tipagem TypeScript completa
- Variantes customizáveis
- Acessibilidade (ARIA labels, roles)
- Responsividade
- Estados de loading e error

### Sistema de Temas

Cores configuradas no Tailwind:
- **Primary (Medical Blue)**: #0066CC
- **Success**: #00AA55
- **Warning**: #FFC107
- **Danger**: #DC3545
- **Medical Light Blue**: #E8F4F8

## Credenciais de Teste

O sistema está configurado com dados mock para desenvolvimento:

```
Funcionário:
  Email: employee@test.com
  Senha: password123

Enfermeiro:
  Email: nurse@test.com
  Senha: password123

Gerente:
  Email: manager@test.com
  Senha: password123
```

## Dados Mock

Atualmente o sistema utiliza dados mock localizados em `src/utils/mockData.ts`. Isso permite desenvolvimento sem depender do backend.

Os serviços estão preparados para integração com API real - basta descomentar as chamadas de API nos arquivos de serviço.

## Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Build de produção
npm run preview  # Preview do build
npm run lint     # Lint do código
```

## Próximos Passos

### Páginas a Implementar
- [ ] Minhas Vacinas (Employee)
- [ ] Agenda Completa (Nurse)
- [ ] Gerenciar Vacinas (Manager)
- [ ] Gerenciar Usuários (Manager)
- [ ] Relatórios (Manager)
- [ ] Perfil do Usuário

### Funcionalidades
- [ ] Integração com API real
- [ ] Sistema de notificações em tempo real
- [ ] Filtros e busca em tabelas
- [ ] Paginação
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Upload de arquivos
- [ ] Gráficos e dashboards avançados
- [ ] PWA (Progressive Web App)
- [ ] Testes unitários e E2E

## Boas Práticas Implementadas

1. **TypeScript Strict Mode** - Sem uso de `any`
2. **Component Composition** - Componentes pequenos e reutilizáveis
3. **Custom Hooks** - Lógica compartilhada extraída
4. **Error Boundaries** - Tratamento de erros
5. **Accessibility** - ARIA labels, roles semânticos
6. **Responsive Design** - Mobile-first approach
7. **Code Organization** - Estrutura clara e escalável
8. **Performance** - Lazy loading, memoization quando necessário

## Convenções de Código

- **Componentes**: PascalCase (`Button.tsx`)
- **Funções/Variáveis**: camelCase (`formatDate`)
- **Constantes**: UPPER_SNAKE_CASE (`API_URL`)
- **Tipos/Interfaces**: PascalCase (`UserRole`)
- **Arquivos de serviço**: kebab-case (`auth.service.ts`)

## Suporte

Para dúvidas ou problemas, consulte a documentação ou entre em contato com a equipe de desenvolvimento.

## Licença

© 2024 Univas Enfermagem. Todos os direitos reservados.
