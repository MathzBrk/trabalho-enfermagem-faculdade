# Implementação de Agendamento de Vacinas - Frontend

## Visão Geral

Este documento descreve a implementação completa da funcionalidade de agendamento de vacinas (vaccine scheduling) no frontend React/TypeScript do sistema.

## Estrutura de Arquivos Criados/Modificados

### 1. Types e Interfaces (`src/types/index.ts`)

**Adicionado:**
- `VaccineSchedulingStatus` enum (SCHEDULED, CONFIRMED, CANCELLED, COMPLETED)
- Interface `VaccineScheduling` atualizada com novos campos
- Interface `CreateVaccineSchedulingData` (sem userId - usa usuário autenticado)
- Interface `UpdateVaccineSchedulingData`
- Interface `ListVaccineSchedulingsParams`

### 2. Serviços (`src/services/vaccineScheduling.service.ts`)

**Funções implementadas:**
- `create(data)` - Criar agendamento para o usuário autenticado
- `getById(id)` - Buscar agendamento por ID
- `list(params)` - Listar agendamentos com paginação e filtros
- `getByDate(date?)` - Buscar agendamentos por data (padrão: hoje)
- `getNurseMonthlySchedulings(nurseId, year, month)` - Agendamentos mensais do enfermeiro
- `update(id, data)` - Atualizar agendamento
- `delete(id)` - Cancelar agendamento (soft delete)
- `confirm(id)` - Confirmar agendamento (altera status para CONFIRMED)

**Tratamento de Erros:**
Mapeamento de erros da API para mensagens amigáveis:
- `InsufficientStockError`: "Estoque insuficiente para esta vacina"
- `InvalidSchedulingDateError`: "A data deve ser no futuro"
- `MissingPreviousDoseError`: "Você precisa agendar as doses anteriores primeiro"
- `DuplicateSchedulingError`: "Você já tem um agendamento para esta dose"
- E outros...

### 3. Hooks (`src/hooks/useVaccineSchedulings.ts`)

**Hook customizado** que fornece:
- Estado: `schedulings`, `pagination`, `isLoading`, `error`
- Funções:
  - `fetchSchedulings(params)` - Buscar lista com filtros
  - `getSchedulingById(id)` - Buscar por ID
  - `getSchedulingsByDate(date?)` - Buscar por data
  - `createScheduling(data)` - Criar novo
  - `updateScheduling(id, data)` - Atualizar
  - `confirmScheduling(id)` - Confirmar
  - `cancelScheduling(id)` - Cancelar
  - `clearError()` - Limpar erro

### 4. Componentes

#### 4.1 `SchedulingCard` (`src/components/vaccineScheduling/SchedulingCard.tsx`)
Card para exibir um agendamento individual com:
- Nome da vacina e fabricante
- Status com badge colorido
- Data e hora formatados
- Número da dose
- Enfermeiro atribuído (se houver)
- Informações do paciente (opcional, para managers)
- Observações
- Botões de ação: Confirmar, Cancelar, Detalhes

**Props:**
- `scheduling: VaccineScheduling`
- `showUserInfo?: boolean` - Mostrar info do paciente (para managers)
- `onConfirm?: (id) => void`
- `onCancel?: (id) => void`
- `onViewDetails?: (id) => void`
- `isLoading?: boolean`

#### 4.2 `SchedulingMiniCard` (`src/components/vaccineScheduling/SchedulingMiniCard.tsx`)
Card compacto para exibir na aplicação de vacinas:
- Mostra vacina, paciente, dose, horário, enfermeiro
- Estilo visual de confirmação (fundo azul)

**Props:**
- `scheduling: VaccineScheduling`

#### 4.3 `SchedulingFilters` (`src/components/vaccineScheduling/SchedulingFilters.tsx`)
Componente de filtros com:
- Status (todos, agendado, confirmado, cancelado, concluído)
- Vacina
- Usuário (apenas para managers)
- Data inicial
- Data final
- Botão "Limpar filtros"
- Responsivo (colapsa em mobile)

**Props:**
- `onFilterChange: (filters) => void`
- `vaccines?: Vaccine[]`
- `users?: User[]`
- `showUserFilter?: boolean` - Mostrar filtro de usuário (managers)
- `isLoading?: boolean`

#### 4.4 `SchedulingForm` (`src/components/vaccineScheduling/SchedulingForm.tsx`)
Formulário de criação de agendamento com:
- Seleção de vacina (com info de doses requeridas)
- Número da dose (validação baseada na vacina)
- Data e hora (deve ser no futuro)
- Enfermeiro (opcional)
- Observações (opcional)
- Validações em tempo real
- Mensagens de erro amigáveis

**Props:**
- `onSubmit: (data) => Promise<void>`
- `onCancel: () => void`
- `isLoading?: boolean`

**Validações:**
- Data deve ser no futuro
- Dose deve estar entre 1 e vaccine.dosesRequired
- Campos obrigatórios

### 5. Páginas

#### 5.1 `CreateSchedulingPage` (`src/pages/VaccineScheduling/CreateSchedulingPage.tsx`)
Página de criação de agendamento:
- Layout com DashboardLayout
- Botão voltar
- Mensagens de sucesso/erro
- Formulário de criação
- Caixa de informações importantes
- Redirect automático após sucesso

#### 5.2 `SchedulingsListPage` (`src/pages/VaccineScheduling/SchedulingsListPage.tsx`)
Página de listagem de agendamentos:
- Cabeçalho com botão "Novo Agendamento"
- Filtros (status, vacina, usuário*, data)
- Grid de cards (responsivo)
- Paginação
- Modal de confirmação para cancelamento
- Ações: Confirmar, Cancelar
- Estado vazio com call-to-action
- Loading states

**Recursos por role:**
- EMPLOYEE/NURSE: Veem apenas seus agendamentos
- MANAGER: Vê todos os agendamentos + filtro por usuário

### 6. Integração com Aplicação de Vacinas

**Arquivo modificado:** `src/components/vaccineApplications/UnifiedApplicationForm.tsx`

**Mudanças:**
1. Substituição da chamada mock por `vaccineSchedulingService.getByDate()`
2. Filtro de agendamentos ativos (SCHEDULED e CONFIRMED)
3. Substituição do display de informações por `SchedulingMiniCard`

**Fluxo:**
1. Enfermeiro abre formulário de aplicação
2. Seleciona "Aplicação Agendada"
3. Sistema busca agendamentos do dia
4. Enfermeiro seleciona agendamento
5. SchedulingMiniCard exibe informações de confirmação
6. Enfermeiro registra a aplicação

### 7. Rotas

**Arquivo modificado:** `src/routes/index.tsx`

**Rotas adicionadas:**
- `/schedulings` - Lista de agendamentos (todos os usuários)
- `/schedulings/new` - Criar agendamento (todos os usuários)

**Proteção:**
Ambas as rotas usam `<ProtectedRoute>` sem restrição de role - todos os usuários autenticados podem acessar.

### 8. Navegação

**Arquivo modificado:** `src/components/layout/Sidebar.tsx`

**Item adicionado:**
- "Meus Agendamentos" (ícone: Calendar)
- Visível para todos os usuários
- Link para `/schedulings`

### 9. Componentes UI Atualizados

**Arquivo modificado:** `src/components/ui/Badge.tsx`

**StatusBadge atualizado** com novos status:
- CONFIRMED (success - verde)
- COMPLETED (default - cinza)

## Regras de Negócio Implementadas

### Permissões
- **EMPLOYEE/NURSE**: Podem criar agendamentos apenas para si mesmos
- **EMPLOYEE/NURSE**: Veem apenas seus próprios agendamentos
- **MANAGER**: Vê todos os agendamentos e pode filtrar por usuário

### Validações
1. **Data futura**: Agendamento deve ser para data/hora futura
2. **Sequência de doses**: Para dose > 1, deve existir agendamento da dose anterior
3. **Intervalo entre doses**: Respeita intervalDays da vacina
4. **Duplicatas**: Não permite agendamento duplicado para mesma vacina/dose
5. **Estoque**: Valida disponibilidade de estoque
6. **Número de dose**: Deve estar entre 1 e vaccine.dosesRequired

### Status Flow
```
SCHEDULED → CONFIRMED → COMPLETED
    ↓
CANCELLED (estado terminal)
```

### Ações por Status
- **SCHEDULED**: Pode confirmar ou cancelar
- **CONFIRMED**: Pode cancelar
- **CANCELLED**: Sem ações disponíveis
- **COMPLETED**: Sem ações disponíveis

## Dependências

### Bibliotecas utilizadas
- `date-fns` - Formatação de datas
- `lucide-react` - Ícones
- `react-router-dom` - Navegação

### Componentes internos
- DashboardLayout
- Card, CardHeader, CardContent, CardTitle
- Button
- Badge
- Modal
- Input (via forms)

## Fluxo de Uso

### Criar Agendamento (Qualquer usuário)
1. Clicar em "Meus Agendamentos" no menu
2. Clicar em "Novo Agendamento"
3. Selecionar vacina
4. Informar número da dose
5. Escolher data/hora
6. (Opcional) Selecionar enfermeiro
7. (Opcional) Adicionar observações
8. Clicar em "Agendar"
9. Sistema valida e cria agendamento
10. Notificação é enviada ao usuário e enfermeiro (se atribuído)

### Listar e Gerenciar Agendamentos
1. Acessar "Meus Agendamentos"
2. Aplicar filtros se necessário
3. Visualizar cards de agendamentos
4. Confirmar agendamento (altera status)
5. Cancelar agendamento se necessário

### Aplicar Vacina com Agendamento (Enfermeiro)
1. Acessar "Aplicações de Vacinas"
2. Clicar em "Registrar Nova Aplicação"
3. Selecionar "Aplicação Agendada"
4. Escolher agendamento da lista do dia
5. Ver informações no SchedulingMiniCard
6. Selecionar lote
7. Informar local de aplicação
8. Adicionar observações
9. Registrar aplicação
10. Status do agendamento muda para COMPLETED

## Melhorias Futuras

### Possíveis Adições
1. Notificações push/email automáticas
2. Lembretes antes do agendamento
3. Calendário visual (view mensal)
4. Reagendamento automático
5. Lista de espera para vacinas sem estoque
6. Exportação de relatórios
7. Integração com Google Calendar
8. QR Code para check-in
9. Histórico de alterações do agendamento
10. Avaliação pós-aplicação

### Otimizações
1. Cache de queries com React Query
2. Virtualização de listas longas
3. Debounce em filtros
4. Skeleton loading
5. Infinite scroll na listagem

## Testes Sugeridos

### Unitários
- Services: Chamadas API corretas
- Hooks: Estado gerenciado corretamente
- Componentes: Renderização e interações

### Integração
- Fluxo completo de criação
- Fluxo de confirmação/cancelamento
- Integração com aplicação de vacinas
- Filtros e paginação

### E2E
- Criar agendamento como EMPLOYEE
- Ver agendamentos como MANAGER
- Aplicar vacina com agendamento como NURSE
- Cancelar agendamento próprio

## Troubleshooting

### Erro: "Estoque insuficiente"
- Verificar totalStock da vacina
- Verificar agendamentos ativos (reservam estoque)

### Erro: "Você precisa agendar as doses anteriores primeiro"
- Criar agendamento para dose anterior
- Verificar que dose anterior não está cancelada

### Erro: "A data deve ser no futuro"
- Verificar timezone do navegador
- Verificar se data selecionada é realmente futura

### Agendamentos não aparecem na aplicação
- Verificar se há agendamentos para hoje
- Verificar status (apenas SCHEDULED e CONFIRMED aparecem)
- Verificar role (EMPLOYEE não tem acesso)

## Documentação da API

Para detalhes completos da API, consulte:
`/home/matheus-borges/projetos/univas-enfermagem/app/api/docs/api/vaccine-scheduling.md`
