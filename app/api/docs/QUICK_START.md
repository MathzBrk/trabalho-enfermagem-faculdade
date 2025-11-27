# Quick Start Guide

## Setup in 5 steps

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# The .env has already been configured, but you can adjust it if necessary
```

### 3. Start Postgre-SQL
```bash
npm run docker:up
```

Wait a few seconds for the database to initialize completely.

### 4. Configure Prisma
```bash
# Generate Prisma Client
npm run prisma:generate

# Create and apply migrations (use --name to avoid interactive prompt)
npx prisma migrate dev --name init
```

### 5. Start application
```bash
npm run start:dev
```

## Verify everything is working

### Check Docker
```bash
docker ps
# You should see the container: univas-enfermagem-db
```

### Check database with Prisma Studio
```bash
npm run prisma:studio
# Opens at http://localhost:5555
```

### PostgreSQL logs
```bash
npm run docker:logs
```

## Next steps

1. Create seeds to populate the database with initial data
2. Implement API endpoints
3. Add validations with Zod
4. Implement JWT authentication
5. Create tests

## Useful commandos Docker

```bash
# Stop containers
npm run docker:down

# View logs
npm run docker:logs

# Reset database (CAUTION!)
npm run docker:reset

# Open Prisma Studio
npm run prisma:studio

# Run tests
npm test
```

## Troubleshooting

### Error "Port 5432 already in use"
You already have PostgreSQL running. Change `POSTGRES_PORT=5433` in `.env` and update the `DATABASE_URL`.

### Error connecting to database
```bash
# Restart the container
npm run docker:down
npm run docker:up

# Wait 10 seconds and try again
```

### Prisma error
```bash
# Regenerate the client
npm run prisma:generate
```

For more details, see [README.Docker.md](README.Docker.md)
