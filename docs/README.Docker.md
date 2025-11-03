# Docker Setup - Univas Enfermagem

## Prerequisites

- Docker
- Docker Compose
- Node.js 20+ (for local development)

## Initial Setup

### 1. Configure environment variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Edit the `.env` file as needed. The default configuration already works for local development.

### 2. Start PostgreSQL via Docker

```bash
npm run docker:up
```

Or directly:

```bash
docker compose up -d
```

### 3. Generate the Prisma Client

```bash
npm run prisma:generate
```

### 4. Run migrations

```bash
npm run prisma:migrate
```

If this is the first time, you will be prompted for a migration name, e.g., `init`

### 5. Start the application in development mode

```bash
npm run start:dev
```

## Available Scripts

### Docker

- `npm run docker:up` - Starts the containers
- `npm run docker:down` - Stops the containers
- `npm run docker:logs` - Views the logs
- `npm run docker:reset` - Removes volumes and restarts (CAUTION: deletes data!)

### Prisma

- `npm run prisma:generate` - Generates the Prisma Client
- `npm run prisma:migrate` - Creates and applies migrations in development
- `npm run prisma:migrate:deploy` - Applies migrations in production
- `npm run prisma:studio` - Opens visual database interface
- `npm run prisma:seed` - Runs seed (when implemented)

## Execution Modes

### Option 1: PostgreSQL only in Docker (Recommended for development)

This is the default configured mode. PostgreSQL runs in Docker, but you run the application locally with hot-reload:

```bash
# Start PostgreSQL only
npm run docker:up

# In another terminal, run the application
npm run start:dev
```

**Advantages:**
- Hot-reload working
- Easier debugging
- Better performance

### Option 2: Everything in Docker

To run both PostgreSQL and the application in Docker, uncomment the `app` section in [docker compose.yml](docker compose.yml) and run:

```bash
docker compose up -d
```

**Important:** Remember to change the `DATABASE_URL` in `.env` from `localhost` to `postgres`:
```
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/univas_enfermagem?schema=public"
```

## Access the Database

### Via Prisma Studio (Recommended)

```bash
npm run prisma:studio
```

Access: http://localhost:5555

### Via psql

```bash
docker exec -it univas-enfermagem-db psql -U postgres -d univas_enfermagem
```

### Via external client (DBeaver, pgAdmin, etc.)

- Host: `localhost`
- Port: `5432`
- Database: `univas_enfermagem`
- User: `postgres`
- Password: `postgres`

## Troubleshooting

### Port 5432 is already in use

If you already have PostgreSQL running locally, change the port in `.env`:

```
POSTGRES_PORT=5433
```

And update the `DATABASE_URL`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/univas_enfermagem?schema=public"
```

### Database connection error

Check if the container is running:

```bash
docker ps
```

View the logs:

```bash
npm run docker:logs
```

### Reset the database

```bash
npm run docker:reset
npm run prisma:migrate
```

## Production

For production deployment:

1. Use secure environment variables
2. Change `JWT_SECRET` to a strong key
3. Configure `DATABASE_URL` to point to the production database
4. Run migrations with:
   ```bash
   npm run prisma:migrate:deploy
   ```

## Structure

- `docker compose.yml` - Docker services configuration
- `Dockerfile` - Application image (optional)
- `.dockerignore` - Files ignored in build
- `.env` - Environment variables (not committed)
- `.env.example` - Environment variables template
