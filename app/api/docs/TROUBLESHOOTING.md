### Initial Setup (first time only)

```bash
npm install


npm run docker:up

npm run prisma:generate

npx prisma migrate dev --name init

npm run start:dev
```

### Daily Usage

```bash
npm run docker:up

npm run start:dev

npm run prisma:studio

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
docker ps

npm run docker:logs

npm run docker:down
npm run docker:up
```

### Completely reset database

```bash
npm run docker:reset

npx prisma migrate dev --name init
```

### Outdated Prisma Client

```bash
npm run prisma:generate
```

---

## How to Use Prisma Client

Example usage in code:

```typescript
import prisma from "@infrastructure/database";

import prisma from "@/infrastructure/database";

const user = await prisma.employee.findUnique({
  where: { email: "joao@example.com" },
});
```

## Useful Commands

```bash

npm run docker:up         
npm run docker:down        
npm run docker:logs       
npm run docker:reset       

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
