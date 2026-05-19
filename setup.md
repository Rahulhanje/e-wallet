# E-Wallet

A full-stack digital wallet app built with **React** (frontend) and **Spring Boot** (backend). You can create wallets, add money, send money to other wallets, and track all your transactions.

---

## What You Need Before Starting

Just install these two things:

1. **Git** — to clone the project
   - Download: https://git-scm.com/downloads
   - After installing, open a terminal and check: `git --version`

2. **Docker Desktop** — to run everything (no need to install Java, Node.js, or PostgreSQL separately)
   - Download: https://www.docker.com/products/docker-desktop/
   - After installing, **open Docker Desktop and make sure it's running** (you'll see the whale icon in your taskbar)
   - Check in terminal: `docker --version`

> **That's it!** Docker handles everything else — the database, backend, and frontend all run inside containers.

---

## Setup Steps

### Step 1: Clone the Project

Open a terminal (Command Prompt, PowerShell, or Git Bash) and run:

```bash
git clone https://github.com/Rahulhanje/e-wallet.git
```

Then go into the project folder:

```bash
cd e-wallet
```

### Step 2: Check the Environment File

The project already has a `.env.properties` file with default settings. You can open it to see:

```
db_name=e_wallet
db_username=postgres
db_password=pass
jwt_secret=appSecretKey
```

> **No changes needed** — these defaults work fine for local development.

### Step 3: Start the App

Make sure **Docker Desktop is running**, then run this single command:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

⏳ **First time will take 5-10 minutes** because it downloads and builds everything. After that it'll be much faster.

You'll see a lot of logs scrolling. Wait until you see something like:
- `e-wallet-backend  | Started EWalletApplication`
- `e-wallet-frontend | Compiled successfully`

### Step 4: Open the App

Once everything is running, open your browser and go to:

- **Frontend (the app):** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:8080](http://localhost:8080)
- **API Docs (Swagger):** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

---

## How to Use the App

1. **Register** — Create a new account with your name, email, and password
2. **Login** — Sign in with your credentials
3. **Create a Wallet** — Add a new wallet with an IBAN number
4. **Top Up** — Add money to your wallet
5. **Transfer** — Send money to another wallet using their IBAN
6. **Withdraw** — Take money out of your wallet

---

## Everyday Commands

### Stop the App

Press `Ctrl + C` in the terminal where it's running, then:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```

> ✅ Your data (wallets, transactions, users) is **saved** and will be there when you start again.

### Start Again

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

### Reset Everything (Delete All Data)

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml down -v
```

> ⚠️ The `-v` flag **deletes all your data**. Only use this if you want a fresh start.

---

## Quick Command Reference

| Command | What It Does |
|---------|-------------|
| `docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build` | Start the app |
| `docker compose -f docker-compose.yml -f docker-compose.prod.yml down` | Stop the app (keeps data) |
| `docker compose -f docker-compose.yml -f docker-compose.prod.yml down -v` | Stop the app + delete all data |
| `docker ps` | See running containers |
| `docker compose logs -f backend` | See backend logs |
| `docker compose logs -f frontend` | See frontend logs |

---

## Troubleshooting

**"Docker is not running"**
→ Open Docker Desktop app and wait for it to fully start

**"Port 5432 already in use"**
→ You have PostgreSQL running locally. Stop it or change the port in `docker-compose.yml`

**"Port 3000 already in use"**
→ Something else is using port 3000. Close it or change the port in `docker-compose.prod.yml`

**Build fails with memory error**
→ Open Docker Desktop → Settings → Resources → Increase memory to at least 4 GB

**Frontend can't connect to backend**
→ Make sure all 3 containers are running: `docker ps` should show `e-wallet-db`, `e-wallet-backend`, and `e-wallet-frontend`

---

## Tech Stack

| Part | Technology |
|------|-----------|
| Frontend | React 18, Material UI, Axios |
| Backend | Spring Boot 3, Spring Security, JWT |
| Database | PostgreSQL 14 |
| ORM | Spring Data JPA, Flyway (migrations) |
| Containerization | Docker, Docker Compose |