# Vaccine API Documentation

## Overview

The Vaccine API manages vaccine catalog entries used across the system. It allows creating, listing, retrieving, updating and deleting vaccine types. Some endpoints support pagination and filtering.

Base Path: `/api/vaccines`

Authentication: All endpoints require a valid JWT in the `Authorization` header.

Authorization: Management operations typically require NURSE or MANAGER roles. Reading/listing may be available to EMPLOYEE depending on policy.

---

## Endpoints

### 1. Create Vaccine

Create a new vaccine entry.

- Endpoint: `POST /api/vaccines`
- Authentication: Required
- Authorization: Typically NURSE or MANAGER

#### Request Body (application/json)

| Field | Type | Required | Description |
|---|---:|---:|---|
| `name` | string | yes | Vaccine name (e.g. "Influenza") |
| `manufacturer` | string | yes | Manufacturer name |
| `dosesRequired` | number | yes | Number of doses required (int >= 1) |
| `description` | string | no | Optional description |
| `isObligatory` | boolean | yes | Whether the vaccine is obligatory |
| `intervalDays` | number | no | Interval between doses in days (if applicable) |
| `minStockLevel` | number | no | Minimum stock threshold to trigger alerts |

#### Request Example

```http
POST /api/vaccines
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Hepatitis B",
  "manufacturer": "ACME Pharma",
  "dosesRequired": 3,
  "description": "Hepatitis B vaccine",
  "isObligatory": false,
  "intervalDays": 30,
  "minStockLevel": 20
}
```

#### Success Response (201 Created)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Hepatitis B",
  "manufacturer": "ACME Pharma",
  "dosesRequired": 3,
  "intervalDays": 30,
  "description": "Hepatitis B vaccine",
  "minStockLevel": 20,
  "totalStock": 0,
  "isObligatory": false,
  "createdById": "770g0622-g40d-63f6-c938-668877662222",
  "createdAt": "2025-11-16T12:00:00.000Z"
}
```

#### Error Responses

**400 Bad Request** — Validation failed

**401 Unauthorized**

**403 Forbidden** — Insufficient permissions

**409 Conflict** — Duplicate vaccine (name + manufacturer unique constraint)

---

### 2. List Vaccines

Return a paginated list of vaccines with optional filters.

- Endpoint: `GET /api/vaccines`
- Authentication: Required
- Authorization: Depends on role (commonly all authenticated users can list)

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|---|---:|---:|---:|---|
| `page` | number | no | 1 | Page number (1-indexed) |
| `perPage` | number | no | 10 | Items per page (min 1, max 100) |
| `sortBy` | string | no | `name` | Allowed: `name`, `createdAt`, `updatedAt` |
| `sortOrder` | `asc`\|`desc` | no | `asc` | Sort order |
| `manufacturer` | string | no | - | Filter by manufacturer |
| `isObligatory` | boolean | no | - | Filter obligatory vaccines (true/false) |

#### Request Example

```http
GET /api/vaccines?page=1&perPage=20&manufacturer=ACME%20Pharma&isObligatory=false
Authorization: Bearer <token>
```

#### Success Response (200 OK)

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Hepatitis B",
      "manufacturer": "ACME Pharma",
      "dosesRequired": 3,
      "intervalDays": 30,
      "description": "Hepatitis B vaccine",
      "minStockLevel": 20,
      "totalStock": 120,
      "isObligatory": false,
      "createdAt": "2025-11-16T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

### 3. Get Vaccine by ID

Retrieve a vaccine by its ID. Optionally include batches.

- Endpoint: `GET /api/vaccines/:id`
- Authentication: Required

#### Path Parameters

| Parameter | Type | Required | Description |
|---|---:|---:|---|
| `id` | string (UUID) | yes | Vaccine ID |

#### Query Parameters

| Parameter | Type | Required | Description |
|---|---:|---:|---|
| `include` | string | no | If set to `batches` will include paginated batches (`?include=batches`) |

#### Success Response (200 OK)

Without batches:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Hepatitis B",
  "manufacturer": "ACME Pharma",
  "dosesRequired": 3,
  "intervalDays": 30,
  "description": "Hepatitis B vaccine",
  "minStockLevel": 20,
  "totalStock": 120,
  "isObligatory": false,
  "createdAt": "2025-11-16T12:00:00.000Z"
}
```

With batches (example):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Hepatitis B",
  "batches": {
    "data": [ /* array of VaccineBatch objects */ ],
    "pagination": { "page": 1, "perPage": 20, "total": 2, "totalPages": 1 }
  }
}
```

#### Error Responses

**400 Bad Request** — Invalid ID format

**401 Unauthorized**

**404 Not Found** — Vaccine not found

---

### 4. Get Batches for a Vaccine

Return paginated batches for a specific vaccine.

- Endpoint: `GET /api/vaccines/:id/batches`
- Authentication: Required

#### Path Parameters

| Parameter | Type | Required | Description |
|---|---:|---:|---|
| `id` | string (UUID) | yes | Vaccine ID |

#### Query Parameters (see validator for full list)

| Parameter | Type | Description |
|---|---:|---|
| `page` | number | Page number (default 1) |
| `perPage` | number | Items per page (default 20, max 100) |
| `sortBy` | string | e.g. `expirationDate`, `batchNumber`, `currentQuantity` |
| `sortOrder` | `asc`\|`desc` | Sort order |
| `status` | string | Filter by batch status: `AVAILABLE`, `EXPIRED`, `DEPLETED`, `DISCARDED` |
| `expiringBefore` | string (ISO 8601) | Filter batches expiring before this date |
| `expiringAfter` | string (ISO 8601) | Filter batches expiring after this date |
| `minQuantity` | number | Minimum `currentQuantity` threshold |

#### Success Response (200 OK) — Example

```json
{
  "data": [ /* VaccineBatch objects */ ],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 2,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

### 5. Update Vaccine

Update vaccine fields.

- Endpoint: `PATCH /api/vaccines/:id`
- Authentication: Required
- Authorization: Typically NURSE or MANAGER

#### Request Body (application/json) — all fields optional

| Field | Type | Description |
|---|---:|---|
| `name` | string | New vaccine name |
| `manufacturer` | string | New manufacturer |
| `dosesRequired` | number | Number of doses |
| `description` | string | Description |
| `isObligatory` | boolean | Obligatory flag |
| `intervalDays` | number | Interval between doses |
| `minStockLevel` | number | Minimum stock threshold |

#### Success Response (200 OK)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Hepatitis B",
  "manufacturer": "ACME Pharma",
  "dosesRequired": 3,
  "intervalDays": 30,
  "description": "Updated description",
  "minStockLevel": 15,
  "updatedAt": "2025-11-17T10:00:00.000Z"
}
```

---

### 6. Delete Vaccine

Hard delete a vaccine record.

- Endpoint: `DELETE /api/vaccines/:id`
- Authentication: Required
- Authorization: Typically MANAGER

#### Success Response (204 No Content)

No body returned.

#### Error Responses

**401 Unauthorized**

**403 Forbidden**

**404 Not Found** — Vaccine not found

---

## Business Rules

- The combination of `name` + `manufacturer` is unique (Prisma constraint). Attempts to create duplicates return 409 Conflict.
- `totalStock` is maintained by the service/store when batches are created, updated or when applications are recorded.
- `minStockLevel` can be used by background jobs or alerts to notify managers when stock is low.
- Soft delete is used across the system (`deletedAt` field). Some endpoints may respect soft-deleted records differently.

## Vaccine Response Fields

| Field | Type | Description |
|---|---:|---|
| `id` | string | Vaccine UUID |
| `name` | string | Vaccine name |
| `manufacturer` | string | Manufacturer name |
| `description` | string | Optional description |
| `dosesRequired` | number | Required doses count |
| `intervalDays` | number | Interval between doses |
| `minStockLevel` | number | Minimum stock level for alerts |
| `totalStock` | number | Current aggregated stock from batches |
| `isObligatory` | boolean | Whether vaccine is obligatory |
| `createdById` | string | User who created the vaccine |
| `createdAt` | string (ISO 8601) | Creation timestamp |
| `updatedAt` | string (ISO 8601) | Update timestamp |

## Integration Notes

- Use `GET /api/vaccines` to populate vaccine selectors for scheduling and applications.
- When creating an application, prefer selecting a specific batch returned by `/api/vaccines/:id/batches` with `status=AVAILABLE` and sufficient `currentQuantity`.
- Use `?include=batches` on `GET /api/vaccines/:id` for a quick overview that includes batches.

---

_End of Vaccine API documentation._
# Documentação da API — Vaccine

## Visão Geral

API para gerenciamento de tipos de vacinas.

Base Path: `/api/vaccines`

Autenticação: Todos endpoints requerem token JWT no header `Authorization: Bearer <token>`.

Permissões: operações de criação/edição/exclusão requerem papel apropriado (ex: MANAGER). Usuários comuns podem listar e visualizar detalhes.

---

## Endpoints

### 1. Criar Vacina

Criar um novo tipo de vacina no catálogo.

- Endpoint: `POST /api/vaccines`
- Autenticação: Obrigatória
- Autorização: Requer permissão administrativa (ex: MANAGER)

#### Body (JSON)

| Campo | Tipo | Obrigatório | Descrição |
|---|---:|---:|---|
| `name` | string | sim | Nome da vacina (máx 100 chars) |
| `manufacturer` | string | sim | Fabricante (máx 100 chars) |
| `dosesRequired` | number | sim | Número de doses requeridas (int >= 1) |
| `description` | string | não | Descrição (máx 500 chars) |
| `isObligatory` | boolean | sim | Se a vacina é obrigatória no sistema |
| `intervalDays` | number | não | Intervalo em dias entre doses (se aplicável) |
| `minStockLevel` | number | não | Nível mínimo de estoque (>= 0) |

#### Exemplo de Request

```http
POST /api/vaccines
Authorization: Bearer eyJ...token
Content-Type: application/json

{
  "name": "Influenza",
  "manufacturer": "ACME Pharma",
  "dosesRequired": 1,
  "description": "Vacina anual contra influenza",
  "isObligatory": false,
  "intervalDays": null,
  "minStockLevel": 20
}
```

#### Sucesso (201 Created)

Resposta retorna o recurso criado (formato conforme modelo Prisma):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Influenza",
  "manufacturer": "ACME Pharma",
  "description": "Vacina anual contra influenza",
  "dosesRequired": 1,
  "intervalDays": null,
  "totalStock": 0,
  "minStockLevel": 20,
  "isObligatory": false,
  "createdById": "770g0622-g40d-63f6-c938-668877662222",
  "createdAt": "2025-11-16T12:00:00.000Z",
  "updatedAt": "2025-11-16T12:00:00.000Z"
}
```

#### Erros Comuns

- 400 Bad Request — Validação do body (ex: `name` ausente ou `dosesRequired` inválido)
- 401 Unauthorized — Token ausente/inválido
- 403 Forbidden — Usuário sem permissão para criar vacinas
- 409 Conflict — Vacina com mesmo `name` e `manufacturer` já existe

---

### 2. Listar Vacinas (Paginação)

Retorna lista paginada de vacinas com filtros.

- Endpoint: `GET /api/vaccines`
- Autenticação: Obrigatória

#### Query Parameters

| Parâmetro | Tipo | Obrigatório | Padrão | Descrição |
|---|---:|---:|---:|---|
| `page` | number | não | 1 | Página (>=1) |
| `perPage` | number | não | 20 | Itens por página (1..100) |
| `sortBy` | string | não | `name` | Campo para ordenar (`name`,`createdAt`,`updatedAt`) |
| `sortOrder` | string | não | `asc` | `asc` ou `desc` |
| `manufacturer` | string | não | - | Filtra por fabricante |
| `isObligatory` | boolean | não | - | Filtra vacinas obrigatórias (true/false) |

#### Exemplo de Request

```
GET /api/vaccines?page=1&perPage=10&manufacturer=ACME%20Pharma&isObligatory=false
Authorization: Bearer eyJ...token
```

#### Sucesso (200 OK)

Retorna um objeto paginado conforme padrão do projeto:

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Influenza",
      "manufacturer": "ACME Pharma",
      "dosesRequired": 1,
      "intervalDays": null,
      "totalStock": 120,
      "minStockLevel": 20,
      "isObligatory": false,
      "createdAt": "2025-11-16T12:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

#### Erros

- 400 Bad Request — Parâmetros de query inválidos
- 401 Unauthorized

---

### 3. Obter Vacina por ID

Retorna dados completos da vacina. Suporta `?include=batches` para incluir lotes.

- Endpoint: `GET /api/vaccines/:id`
- Autenticação: Obrigatória

#### Path Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|---|---:|---:|---|
| `id` | string (UUID) | sim | ID da vacina |

#### Query

| Parâmetro | Tipo | Descrição |
|---|---:|---|
| `include` | string | se `batches`, inclui lotes relacionados (paginados) |

#### Exemplo de Request

```
GET /api/vaccines/550e8400-e29b-41d4-a716-446655440000?include=batches
Authorization: Bearer eyJ...token
```

#### Sucesso (200 OK)

Resposta sem `include`:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Influenza",
  "manufacturer": "ACME Pharma",
  "description": "Vacina anual contra influenza",
  "dosesRequired": 1,
  "intervalDays": null,
  "totalStock": 120,
  "minStockLevel": 20,
  "isObligatory": false,
  "createdById": "770g0622-g40d-63f6-c938-668877662222",
  "createdAt": "2025-11-16T12:00:00.000Z",
  "updatedAt": "2025-11-16T12:00:00.000Z"
}
```

Resposta com `include=batches` (exemplo simplificado):

```json
{
  "vaccine": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Influenza",
    "manufacturer": "ACME Pharma",
    "dosesRequired": 1,
    "totalStock": 120
  },
  "batches": {
    "data": [
      {
        "id": "660f9511-f39c-52e5-b827-557766551111",
        "batchNumber": "L-2025-001",
        "currentQuantity": 100,
        "initialQuantity": 100,
        "expirationDate": "2026-03-01T00:00:00.000Z",
        "status": "AVAILABLE",
        "receivedDate": "2025-11-01T00:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

#### Erros

- 400 Bad Request — ID inválido
- 401 Unauthorized
- 404 Not Found — Vacina não encontrada

---

### 4. Listar Lotes de uma Vacina

Retorna lotes do tipo de vacina especificado (paginado e filtrável).

- Endpoint: `GET /api/vaccines/:id/batches`
- Autenticação: Obrigatória

#### Path Parameters

| Parâmetro | Tipo | Obrigatório |
|---|---:|---:|
| `id` | string (UUID) | sim |

#### Query Parameters (filtros disponíveis)

| Parâmetro | Tipo | Descrição |
|---|---:|---|
| `page` | number | Página (>=1) |
| `perPage` | number | Itens por página (1..100) |
| `sortBy` | string | Campo para ordenar (`batchNumber`,`expirationDate`,`receivedDate`,`currentQuantity`,`initialQuantity`,`status`,`createdAt`) |
| `sortOrder` | `asc` \| `desc` | Ordem de sort |
| `status` | string | Filtrar por status (`AVAILABLE`, `EXPIRED`, `DEPLETED`, `DISCARDED`) |
| `expiringBefore` | ISO datetime | Retorna lotes que expiram antes desta data |
| `expiringAfter` | ISO datetime | Retorna lotes que expiram depois desta data |
| `minQuantity` | number | Retorna lotes com quantidade atual >= valor |

#### Exemplo de Request

```
GET /api/vaccines/550e8400-e29b-41d4-a716-446655440000/batches?page=1&perPage=20&status=AVAILABLE
Authorization: Bearer eyJ...token
```

#### Sucesso (200 OK)

```json
{
  "data": [
    {
      "id": "660f9511-f39c-52e5-b827-557766551111",
      "batchNumber": "L-2025-001",
      "currentQuantity": 100,
      "initialQuantity": 100,
      "expirationDate": "2026-03-01T00:00:00.000Z",
      "receivedDate": "2025-11-01T00:00:00.000Z",
      "status": "AVAILABLE"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

#### Erros

- 400 Bad Request — Parâmetros inválidos
- 401 Unauthorized
- 404 Not Found — Vacina não existe

---

### 5. Atualizar Vacina

Atualiza campos editáveis de uma vacina.

- Endpoint: `PATCH /api/vaccines/:id`
- Autenticação: Obrigatória
- Autorização: Requer permissão administrativa (ex: MANAGER)

#### Body (JSON) — todos campos opcionais

| Campo | Tipo | Descrição |
|---|---:|---|
| `name` | string | Novo nome |
| `manufacturer` | string | Novo fabricante |
| `dosesRequired` | number | Número de doses |
| `description` | string | Descrição |
| `isObligatory` | boolean | Obrigatoriedade |
| `intervalDays` | number | Intervalo entre doses |
| `minStockLevel` | number | Nível mínimo de estoque |

#### Sucesso (200 OK)

Retorna o recurso atualizado (mesmo formato que GET por id).

#### Erros

- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found

---

### 6. Deletar Vacina (Hard Delete)

Remove a vacina permanentemente (endpoint implementado como hard delete).

- Endpoint: `DELETE /api/vaccines/:id`
- Autenticação: Obrigatória
- Autorização: Requer permissão administrativa

#### Sucesso (204 No Content)

Resposta vazia.

#### Erros

- 401 Unauthorized
- 403 Forbidden
- 404 Not Found

---

## Regras de Negócio e Observações

- A combinação `name + manufacturer` é única (índice único). Tentativa de duplicar deve retornar 409 Conflict.
- `totalStock` é atualizado automaticamente ao criar/atualizar/excluir lotes — não é fornecido na criação de vacina (inicia em 0).
- Exclusão é hard delete conforme rota; alguns módulos podem optar por soft delete em outras entidades.
- Ao obter vacina com `include=batches`, os lotes são retornados em formato paginado.

## Campos de Resposta (Vaccine)

| Campo | Tipo | Descrição |
|---|---:|---|
| `id` | string | UUID |
| `name` | string | Nome da vacina |
| `manufacturer` | string | Fabricante |
| `description` | string? | Descrição |
| `dosesRequired` | number | Doses requeridas |
| `intervalDays` | number? | Intervalo entre doses |
| `totalStock` | number | Soma das quantidades atuais dos lotes |
| `minStockLevel` | number | Nível mínimo desejado |
| `isObligatory` | boolean | Obrigatoriedade |
| `createdById` | string | Usuário que criou o registro |
| `createdAt` | string (ISO) | Timestamp de criação |
| `updatedAt` | string (ISO) | Timestamp de última atualização |

## Notas para o Frontend / Integração

- Sempre paginar requisições de listagem para evitar transferências grandes.
- Para contador de estoque, utilizar o campo `totalStock` do recurso `Vaccine` ou somar `currentQuantity` dos lotes via `/vaccines/:id/batches`.
- Mensagens de erro seguem o padrão de erro do API (ver `notifications.md` para estilo de erros). 

---

_End of Vaccine API documentation._
