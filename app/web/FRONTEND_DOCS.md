# Documentação Frontend - Sistema de Vacinação

## Estrutura de Arquivos Criada

```
app/web/src/
├── components/
│   ├── common/                    # Componentes reutilizáveis
│   │   ├── FormInput.tsx          # Input com integração react-hook-form
│   │   ├── MaskedInput.tsx        # Input com máscaras (CPF, Telefone)
│   │   ├── Select.tsx             # Select com integração react-hook-form
│   │   ├── FileUpload.tsx         # Upload de arquivo com preview
│   │   └── index.ts               # Exports
│   └── ui/                        # Componentes UI base (já existentes)
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       └── ...
├── hooks/
│   ├── useRegister.ts             # Hook para registro de usuário
│   └── useProfile.ts              # Hook para gerenciamento de perfil
├── pages/
│   ├── Registration.tsx           # Tela de cadastro
│   └── Profile.tsx                # Tela de perfil
├── services/
│   ├── auth.service.ts            # Atualizado para API real
│   └── user.service.ts            # Atualizado para API real
├── types/
│   └── index.ts                   # Types atualizados
├── utils/
│   ├── formatters.ts              # Funções de formatação (CPF, Phone, etc)
│   └── validationSchemas.ts      # Schemas Zod para validação
└── store/
    └── authStore.ts               # Store Zustand (já existente)
```

## Endpoints da API Backend

### Autenticação

#### POST /auth/register
Registra um novo usuário no sistema.

**Request Body:**
```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "Senha123!@",
  "cpf": "12345678900",
  "phone": "11987654321",
  "role": "EMPLOYEE" | "NURSE" | "MANAGER",
  "coren": "123456" // Obrigatório apenas se role = NURSE
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@exemplo.com",
      "cpf": "12345678900",
      "phone": "11987654321",
      "role": "EMPLOYEE",
      "coren": null,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here",
    "expiresIn": "7d"
  }
}
```

#### POST /auth/login
Autentica um usuário existente.

**Request Body:**
```json
{
  "email": "joao@exemplo.com",
  "password": "Senha123!@"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "token": "jwt_token_here",
    "expiresIn": "7d"
  }
}
```

### Usuários

#### GET /users/:id
Obtém informações de um usuário específico.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "cpf": "12345678900",
  "phone": "11987654321",
  "role": "EMPLOYEE",
  "coren": null,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### PATCH /users/:id
Atualiza informações de um usuário.

**Headers:** `Authorization: Bearer <token>`

**Request Body:** (todos os campos opcionais)
```json
{
  "name": "João Silva Atualizado",
  "phone": "11988888888",
  "role": "NURSE",
  "coren": "123456",
  "isActive": true
}
```

**Regras de Autorização:**
- Usuários normais podem atualizar apenas: `name`, `phone`
- MANAGER pode atualizar todos os campos

**Response:** `200 OK`
```json
{
  /* updated user object */
}
```

## Componentes Principais

### 1. Registration (Tela de Cadastro)

**Localização:** `/app/web/src/pages/Registration.tsx`

**Funcionalidades:**
- Formulário completo de cadastro
- Validação em tempo real com Zod
- Máscaras automáticas para CPF e telefone
- Campo COREN obrigatório apenas para enfermeiros
- Upload de foto de perfil (opcional)
- Requisitos de senha:
  - Mínimo 8 caracteres
  - Pelo menos uma letra maiúscula
  - Pelo menos uma letra minúscula
  - Pelo menos um número
  - Pelo menos um caractere especial
- Confirmação de senha
- Redirecionamento automático após sucesso

**Campos:**
- Nome Completo (obrigatório)
- Email (obrigatório)
- CPF (obrigatório, 11 dígitos)
- Telefone (obrigatório, 10 ou 11 dígitos)
- Função (obrigatório: EMPLOYEE, NURSE, MANAGER)
- COREN (condicional: obrigatório para NURSE)
- Senha (obrigatório)
- Confirmar Senha (obrigatório)
- Foto de Perfil (opcional)

**Validações Especiais:**
- Se `role === 'NURSE'`, COREN é obrigatório
- COREN não pode estar vazio se fornecido
- Senhas devem coincidir

### 2. Profile (Tela de Perfil)

**Localização:** `/app/web/src/pages/Profile.tsx`

**Funcionalidades:**
- Exibe dados do usuário autenticado
- Foto de perfil com upload e preview
- Modo de visualização e edição
- Atualização de dados pessoais
- Apenas MANAGER pode alterar função e status
- Máscaras nos campos de telefone
- Badges indicando função, COREN e status ativo
- Formatação de dados (CPF, telefone, datas)

**Seções:**
1. **Cabeçalho do Perfil**
   - Foto de perfil com opção de upload
   - Nome e email
   - Badges de função, COREN e status
   - Dados básicos (CPF, telefone, data de cadastro)

2. **Formulário de Edição** (quando ativado)
   - Nome
   - Telefone
   - Função (apenas para MANAGER)
   - COREN (se função = NURSE)

## Hooks Customizados

### useRegister

**Localização:** `/app/web/src/hooks/useRegister.ts`

**Funcionalidade:** Gerencia o processo de registro de novos usuários.

**API:**
```typescript
const { register, isLoading, error, clearError } = useRegister();

// register: (data: RegisterData) => Promise<void>
// isLoading: boolean
// error: string | null
// clearError: () => void
```

**Uso:**
```typescript
const { register, isLoading, error } = useRegister();

const handleSubmit = async (data: RegisterFormData) => {
  try {
    await register(data);
    navigate('/dashboard');
  } catch (err) {
    // Erro já está em error state
  }
};
```

### useProfile

**Localização:** `/app/web/src/hooks/useProfile.ts`

**Funcionalidade:** Gerencia visualização e edição do perfil do usuário.

**API:**
```typescript
const {
  user,
  isLoading,
  error,
  updateProfile,
  uploadPhoto,
  refreshProfile,
  clearError
} = useProfile(userId?);

// user: User | null
// isLoading: boolean
// error: string | null
// updateProfile: (data: UpdateUserData) => Promise<void>
// uploadPhoto: (file: File) => Promise<void>
// refreshProfile: () => Promise<void>
// clearError: () => void
```

**Uso:**
```typescript
const { user, updateProfile, uploadPhoto } = useProfile();

const handleUpdate = async (data: UpdateProfileFormData) => {
  await updateProfile(data);
};

const handlePhotoUpload = async (file: File) => {
  await uploadPhoto(file);
};
```

## Componentes de Formulário

### FormInput

Input básico com integração react-hook-form.

```tsx
<FormInput
  label="Nome"
  type="text"
  placeholder="João Silva"
  register={register('name')}
  error={errors.name?.message}
  required
/>
```

### MaskedInput

Input com máscara automática para CPF e telefone.

```tsx
<MaskedInput
  label="CPF"
  mask="cpf"
  placeholder="000.000.000-00"
  register={register('cpf')}
  error={errors.cpf?.message}
  required
/>

<MaskedInput
  label="Telefone"
  mask="phone"
  placeholder="(00) 00000-0000"
  register={register('phone')}
  error={errors.phone?.message}
/>
```

### Select

Select com integração react-hook-form.

```tsx
<Select
  label="Função"
  options={[
    { value: 'EMPLOYEE', label: 'Funcionário' },
    { value: 'NURSE', label: 'Enfermeiro' },
    { value: 'MANAGER', label: 'Gerente' },
  ]}
  placeholder="Selecione..."
  register={register('role')}
  error={errors.role?.message}
  required
/>
```

### FileUpload

Upload de arquivo com preview e drag-and-drop.

```tsx
<FileUpload
  label="Foto de Perfil"
  accept="image/*"
  maxSize={5}
  preview={true}
  onChange={(file) => setPhotoFile(file)}
  helperText="JPG, PNG ou GIF até 5MB"
/>
```

## Utilitários

### Formatadores

**Localização:** `/app/web/src/utils/formatters.ts`

```typescript
// Formatar CPF
formatCPF('12345678900') // '123.456.789-00'
unformatCPF('123.456.789-00') // '12345678900'

// Formatar Telefone
formatPhone('11987654321') // '(11) 98765-4321'
unformatPhone('(11) 98765-4321') // '11987654321'

// Formatar Função
formatRole('EMPLOYEE') // 'Funcionário'

// Formatar Data
formatDate('2024-01-01T00:00:00.000Z') // '01/01/2024'
formatDateTime('2024-01-01T12:30:00.000Z') // '01/01/2024 12:30'

// Obter Iniciais
getInitials('João Silva') // 'JS'
```

### Schemas de Validação

**Localização:** `/app/web/src/utils/validationSchemas.ts`

Schemas Zod que espelham exatamente as validações do backend:

- `RegisterFormSchema`: Validação de cadastro
- `UpdateProfileSchema`: Validação de atualização de perfil
- `LoginFormSchema`: Validação de login

## Como Testar

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env` em `/app/web/`:

```env
VITE_API_URL=http://localhost:3000/api
```

### 2. Instalar Dependências

```bash
cd app/web
npm install
```

### 3. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

### 4. Testar Cadastro de Usuário

1. Acesse `http://localhost:5173/register`
2. Preencha todos os campos obrigatórios
3. Teste diferentes funções (EMPLOYEE, NURSE, MANAGER)
4. Observe validação em tempo real
5. Teste upload de foto (opcional)
6. Submeta o formulário

**Teste Específico para NURSE:**
- Selecione "Enfermeiro" na função
- Campo COREN deve aparecer e ser obrigatório
- Tente submeter sem COREN (deve dar erro)

**Teste de Validação de Senha:**
- Senha muito curta (< 8 caracteres)
- Senha sem maiúscula
- Senha sem minúscula
- Senha sem número
- Senha sem caractere especial
- Senhas não coincidem

### 5. Testar Tela de Perfil

1. Faça login primeiro
2. Acesse `http://localhost:5173/profile`
3. Visualize seus dados
4. Clique em "Editar Perfil"
5. Altere nome e telefone
6. Teste upload de nova foto
7. Salve as alterações

**Teste como MANAGER:**
- Login como gerente
- Acesse perfil
- Observe campos adicionais (função, status)
- Teste alteração de função

### 6. Validar Máscaras de Input

**CPF:**
- Digite apenas números: `12345678900`
- Observe formatação automática: `123.456.789-00`
- Backend recebe valor sem formatação

**Telefone:**
- Digite 10 dígitos: `1133334444`
- Formatação: `(11) 3333-4444`
- Digite 11 dígitos: `11987654321`
- Formatação: `(11) 98765-4321`

### 7. Testar Integração com API

Certifique-se que o backend está rodando:

```bash
cd app/api
npm run dev
```

**Endpoints testados:**
- POST `/api/auth/register` - Cadastro
- POST `/api/auth/login` - Login
- GET `/api/users/:id` - Buscar perfil
- PATCH `/api/users/:id` - Atualizar perfil
- POST `/api/users/:id/photo` - Upload foto (se implementado)

### 8. Testar Estados de Loading e Erro

**Loading:**
- Observe spinner durante submissão
- Botões desabilitados durante loading

**Erro:**
- Teste email duplicado
- Teste CPF inválido
- Teste senha fraca
- Observe mensagens de erro claras

## Fluxo de Dados

```
1. Usuário preenche formulário
   ↓
2. React Hook Form + Zod validam dados
   ↓
3. Se válido, hook customizado é chamado
   ↓
4. Service faz chamada HTTP para API
   ↓
5. Backend valida e processa
   ↓
6. Response retorna ao frontend
   ↓
7. State é atualizado (Zustand)
   ↓
8. UI reflete mudanças
   ↓
9. Redirecionamento (se sucesso)
```

## Boas Práticas Implementadas

1. **Type Safety:** TypeScript em todos os arquivos
2. **Validação:** Schemas Zod sincronizados com backend
3. **Separação de Responsabilidades:**
   - Components: Apenas UI
   - Hooks: Lógica de negócio
   - Services: Chamadas API
   - Utils: Funções auxiliares
4. **Acessibilidade:**
   - Labels apropriados
   - ARIA attributes
   - Mensagens de erro descritivas
5. **UX:**
   - Loading states
   - Error handling
   - Feedback visual
   - Máscaras de input
   - Preview de imagens
6. **Performance:**
   - React.memo onde necessário
   - useCallback para funções
   - Validação otimizada

## Próximos Passos

1. Implementar endpoint de upload de foto no backend
2. Adicionar testes unitários
3. Adicionar testes E2E com Cypress/Playwright
4. Implementar recuperação de senha
5. Adicionar verificação de email
6. Implementar autenticação 2FA
7. Adicionar histórico de alterações de perfil
8. Implementar gestão de permissões mais granular

## Troubleshooting

### Problema: CORS errors
**Solução:** Configure CORS no backend para aceitar requests do frontend

### Problema: Token expirado
**Solução:** Implemente refresh token ou faça logout automático

### Problema: Máscaras não funcionam
**Solução:** Verifique se está usando `MaskedInput` e não `Input` comum

### Problema: Validação não acontece
**Solução:** Certifique-se que o schema Zod está importado corretamente

### Problema: Upload de foto não funciona
**Solução:** Verifique se o endpoint existe no backend e aceita `multipart/form-data`
