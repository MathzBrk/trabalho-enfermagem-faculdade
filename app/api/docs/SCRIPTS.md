# npm Scripts - Complete Guide

## 🚀 Development Scripts

### Start the complete project
```bash
npm run dev
```
**What it does:**
- Starts PostgreSQL in Docker
- Starts the application in watch mode (hot-reload)
- Ideal for getting started with work

---

## 🐳 Docker Scripts

### Start PostgreSQL
```bash
npm run docker:up
```
**What it does:** Starts the PostgreSQL container in background

### Stop containers docker
```bash
npm run docker:down
```
**What it does:** Stops PostgreSQL (data is preserved)

### View PostgreSQL logs
```bash
npm run docker:logs
```
**What it does:** Shows logs in real-time (Ctrl+C to exit)

### Reset PostgreSQL banco de dados
```bash
npm run docker:reset
```
**What it does:**
- ⚠️ **DELETES ALL DATA!**
- Removes the container and volumes
- Creates a new clean container

---

## 🗄️ Prisma Scripts

### Generate Prisma Cliente
```bash
npm run prisma:generate
```
**When to use:**
- After changing `schema.prisma`
- After cloning the repository
- If Prisma imports are not working

### Create/Apply Migration
```bash
npm run prisma:migrate
# or
npx prisma migrate dev --name migration_name
```
**What it does:**
- Creates SQL based on the schema
- Applies it to the database
- Generates Prisma Client automatically

### Deploy Migrations (Production)
```bash
npm run prisma:migrate:deploy
```
**When to use:** Only in production/staging

### Open Prisma Studio
```bash
npm run prisma:studio
```
**What it does:**
- Opens visual interface at http://localhost:5555
- View/edit database data
- No need for pgAdmin!

### Run Seeds
```bash
npm run prisma:seed
```
**What it does:**
- Populates database with test data
- Useful after resetting the database

### Reset Database (Prisma)
```bash
npm run prisma:reset
```
**What it does:**
- ⚠️ **DELETES ALL DATA!**
- Removes all tables
- Applies all migrations again
- Runs seed automatically (if configured)

---


## 🔧 Combined Scripts (Useful Shortcuts)

### Complete Database Setup
```bash
npm run db:setup
```
**What it does:**
1. Starts PostgreSQL
2. Generates Prisma Client
3. Applies all migrations

**When to use:**
- First time cloning the project
- After resetting everything



### Total Reset
```bash
npm run db:reset
```
**What it does:**
1. ⚠️ **DELETES EVERYTHING!**
2. Resets Docker (removes volumes)
3. Regenerates Prisma Client

**When to use:**
- Database got messed up
- Want to start from scratch
- Changed the schema significantly

---

## 🏗️ Build Scripts

### Build for Production
```bash
npm run build
```
**What it does:**
- Compiles TypeScript → JavaScript
- Resolves aliases (@modules, @infrastructure, etc)
- Generates `dist/` folder

### Start Production
```bash
npm start
```
**What it does:**
- Runs the compiled version (dist/)
- No hot-reload
- Use after `npm run build`

---

## ✅ Qualidade Scripts

### Format Code
```bash
npm run check
```
**What it does:**
- Formats code with Biome
- Fixes issues automatically

### Testes
```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:push       # With coverage (CI/CD)
```


---


## 📋 Recommended Workflow

### 1️⃣ First time in the project
```bash
npm install
npm run db:setup
npm run prisma:seed  # (optional - if you have seed)
npm run dev
```

### 2️⃣ Working normally
```bash
npm run dev
# Develop...
# Save the file (automatic hot-reload)
```

### 3️⃣ Changed schema.prisma
```bash
# Edit src/infrastructure/database/prisma/schema.prisma
npx prisma migrate dev --name description_of_change
# Prisma Client is regenerated automatically
```


### 4️⃣ Database got messed up
```bash
npm run db:reset
npm run prisma:seed
```

### 5️⃣ Before committing
```bash
npm run check        # Format code
npm test            # Test
git add .
git commit -m "feat: your feature"
```

---

## 🆘 Troubleshooting

### Error: "Prisma Client not found"
```bash
npm run prisma:generate
```

### Error: "Port 5432 already in use"
```bash
# You already have PostgreSQL running
# Option 1: Stop local PostgreSQL
sudo service postgresql stop

# Option 2: Change port in .env
POSTGRES_PORT=5433
```

### Database is weird / with errors
```bash
npm run db:reset
npm run prisma:seed
```

### Docker container won't start
```bash
# See what's wrong
npm run docker:logs

# Reset everything
npm run docker:reset
```

### TypeScript with type errors
```bash
npm run prisma:generate
# Restart VS Code
```

---

## 💡 Pro Tips

### Quick seed
Create aliases in your shell:
```bash
# Add to ~/.bashrc or ~/.zshrc
alias dbseed="npm run prisma:seed"
alias dbreset="npm run db:reset && npm run prisma:seed"
```

### Prisma Studio always available
In a separate terminal:
```bash
npm run prisma:studio
```
Leave it running and access it when needed.

### View database structure
```bash
docker exec univas-enfermagem-db psql -U postgres -d univas_enfermagem -c "\dt"
```

### Quick backup (for testing)
```bash
docker exec univas-enfermagem-db pg_dump -U postgres univas_enfermagem > backup.sql
```

### Restore backup
```bash
cat backup.sql | docker exec -i univas-enfermagem-db psql -U postgres univas_enfermagem
```
