### Initial Setup (first time only)

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL
npm run docker:up

# 3. Generate Prisma Client
npm run prisma:generate

# 4. Create initial migration
npx prisma migrate dev --name init

# 5. Start application
npm run start:dev
```

### Daily Usage

```bash
# Start database
npm run docker:up

# Develop
npm run start:dev

# View database
npm run prisma:studio

# Stop database
npm run docker:down
```

---

## Other Common Issues

### Port 5432 already in use

**If you already have PostgreSQL running locally:**

1. Change in [.env](.env):
```env
POSTGRES_PORT=5433
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/univas_enfermagem?schema=public"
```

2. Restart:
```bash
npm run docker:down
npm run docker:up
```

### Database connection error

```bash
# Check if container is running
docker ps

# View logs
npm run docker:logs

# Restart
npm run docker:down
npm run docker:up
```

### Completely reset database

```bash
# WARNING: Deletes all data!
npm run docker:reset

# Recreate schema
npx prisma migrate dev --name init
```

### Outdated Prisma Client

```bash
# Whenever you change schema.prisma
npm run prisma:generate
```

---

## How to Use Prisma Client

Example usage in code:

```typescript
// Option 1: Direct import from database module
import prisma from "@infrastructure/database";

// Option 2: Import using relative path
import prisma from "@/infrastructure/database";

// Find by email
const user = await prisma.employee.findUnique({
  where: { email: "joao@example.com" },
});
```

## Useful Commands

```bash
# Docker
npm run docker:up          # Start PostgreSQL
npm run docker:down        # Stop containers
npm run docker:logs        # View logs
npm run docker:reset       # Reset everything (deletes data!)

# Prisma
npm run prisma:generate    # Generate client
npm run prisma:studio      # Visual interface
npx prisma migrate dev --name <name>  # New migration
npx prisma migrate deploy  # Deploy migrations (production)

# App
npm run start:dev          # Development
npm run build              # Build for production
npm start                  # Run production
npm test                   # Tests
```

---

## Useful Links

- [Prisma Documentation](https://www.prisma.io/docs)
- [Docker Compose](https://docs.docker.com/compose/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

## Need Help?

1. Check the logs: `npm run docker:logs`
2. Consult the [Docker documentation](README.Docker.md)
3. Consult the [quick start guide](QUICK_START.md)
4. Restart everything: `npm run docker:reset`
