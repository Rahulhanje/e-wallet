# 💰 E-Wallet — Project Presentation

A full-stack digital wallet application for managing wallets, funds, and transactions. Built with **React** on the frontend and **Spring Boot** on the backend.

---

## 📌 What Does This App Do?

This app simulates a **digital wallet system** (like Paytm, Google Pay, or PhonePe). Users can:

- **Register & Login** securely
- **Create wallets** linked to their bank account (using IBAN)
- **Add funds** (top up) to their wallet
- **Transfer money** from one wallet to another
- **Withdraw funds** from their wallet
- **View all transactions** with history and status

---

## 🏦 Banking Terms Used in This Project

### 1. IBAN (International Bank Account Number)

**What is it?**
IBAN is a standard international numbering system used to identify bank accounts across countries. It ensures money goes to the correct account when doing transfers.

**Format:** Country code (2 letters) + Check digits (2 numbers) + Bank account number

**Example:** `DE89 3704 0044 0532 0130 00` (German bank account)

**Why is it needed in this project?**
Every wallet in our app is identified by an IBAN. When you transfer money, you use the receiver's IBAN — just like in real banking. The app also has a **custom IBAN validator** that checks if the IBAN format is mathematically correct using the Modulo 97 algorithm.

### 2. Wallet Balance

**What is it?**
The amount of money currently available in a wallet.

**Why is it needed?**
Before any transfer or withdrawal, the app checks if the wallet has enough balance. If not, it throws an `InsufficientFundsException` — just like when an ATM says "Insufficient funds."

### 3. Transaction

**What is it?**
A record of money movement. Every time money moves (top-up, transfer, or withdrawal), a transaction is created.

**Why is it needed?**
Transactions provide an audit trail — a complete history of all money movements. In real banking, every rupee/dollar moved must be tracked for accountability.

### 4. Reference Number (UUID)

**What is it?**
A unique ID (like `550e8400-e29b-41d4-a716-446655440000`) given to every transaction.

**Why is it needed?**
If there's a dispute or you need to track a specific payment, you can search by reference number. Every real bank transaction has one.

### 5. Transaction Types

The app supports three types of transactions:

| Type | Description |
|------|-------------|
| **Transfer** | Moving money from one wallet to another wallet |
| **Payment** | Making a payment using wallet funds |
| **Shopping** | Using wallet for shopping purchases |

### 6. Transaction Status

Every transaction has a status:

| Status | Meaning |
|--------|---------|
| **PENDING** | Transaction is being processed |
| **SUCCESS** | Transaction completed successfully |
| **ERROR** | Transaction failed (e.g., insufficient funds) |

### 7. JWT (JSON Web Token)

**What is it?**
A secure way to verify who you are after login. After you log in, the server gives you a "token" (a long encrypted string). You send this token with every future request to prove your identity.

**Why is it needed?**
Without JWT, you'd have to send your username/password with every single request — which is unsafe. JWT keeps your session secure and stateless (the server doesn't need to remember you).

### 8. BCrypt (Password Hashing)

**What is it?**
A one-way encryption algorithm for passwords. When you register, your password is converted to a hash like `$2a$10$MMOkMuO8zV...`. Even the database admin can't see your real password.

**Why is it needed?**
If the database gets hacked, no one can read the original passwords. This is a standard security practice in all modern applications.

---

## 🏗️ System Architecture

### High-Level Overview

```mermaid
graph TB
    subgraph Client["🖥️ Client (Browser)"]
        React["React App<br/>Port 3000"]
    end

    subgraph Server["⚙️ Backend Server"]
        SpringBoot["Spring Boot API<br/>Port 8080"]
    end

    subgraph Database["🗄️ Database"]
        PostgreSQL["PostgreSQL<br/>Port 5432"]
    end

    React -->|"HTTP Requests<br/>(REST API + JWT Token)"| SpringBoot
    SpringBoot -->|"SQL Queries<br/>(JPA/Hibernate)"| PostgreSQL
    SpringBoot -->|"JSON Responses"| React
```

### Detailed Architecture (All Layers)

```mermaid
graph TB
    subgraph Frontend["Frontend (React)"]
        Pages["Pages<br/>Dashboard, Wallet,<br/>Transfer, Transaction"]
        Services["API Services<br/>AuthService, HttpService"]
        Axios["Axios HTTP Client"]
    end

    subgraph Backend["Backend (Spring Boot)"]
        Controllers["Controllers<br/>AuthController<br/>WalletController<br/>TransactionController"]
        ServiceLayer["Services<br/>AuthService<br/>WalletService<br/>TransactionService"]
        Security["Security Layer<br/>JWT Filter<br/>BCrypt Encoder"]
        Validators["Validators<br/>IBAN Validator"]
        Mappers["MapStruct Mappers<br/>DTO ↔ Entity"]
        Repository["JPA Repositories"]
    end

    subgraph DB["Database (PostgreSQL)"]
        Tables["Tables: User, Role,<br/>Wallet, Transaction, Type"]
        Flyway["Flyway Migrations"]
    end

    Pages --> Services
    Services --> Axios
    Axios -->|"REST API Calls"| Controllers
    Controllers --> Security
    Security --> ServiceLayer
    ServiceLayer --> Validators
    ServiceLayer --> Mappers
    ServiceLayer --> Repository
    Repository --> Tables
    Flyway -->|"Auto-creates tables"| Tables
```

---

## 🔄 How Key Features Work

### User Registration & Login Flow

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as Frontend (React)
    participant B as Backend (Spring Boot)
    participant DB as PostgreSQL

    Note over U,DB: Registration
    U->>F: Fill signup form
    F->>B: POST /api/v1/auth/signup
    B->>B: Hash password with BCrypt
    B->>DB: Save user + assign ROLE_USER
    DB-->>B: User saved
    B-->>F: 201 Created (user ID)
    F-->>U: Show success, redirect to login

    Note over U,DB: Login
    U->>F: Enter username & password
    F->>B: POST /api/v1/auth/login
    B->>DB: Find user by username
    DB-->>B: Return user with hashed password
    B->>B: Verify password using BCrypt
    B->>B: Generate JWT token (valid 1 hour)
    B-->>F: 200 OK (JWT token + user info)
    F->>F: Store JWT in localStorage
    F-->>U: Redirect to Dashboard
```

### Money Transfer Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database

    U->>F: Enter receiver IBAN, amount
    F->>B: POST /api/v1/wallets/transfer
    Note right of F: Headers: Authorization: Bearer JWT_TOKEN

    B->>DB: Find sender wallet by IBAN
    DB-->>B: Sender wallet (balance: ₹5000)
    B->>DB: Find receiver wallet by IBAN
    DB-->>B: Receiver wallet (balance: ₹3000)

    B->>B: Check: sender balance >= amount?

    alt Insufficient Funds
        B-->>F: 400 Error: Insufficient funds
        F-->>U: Show error message
    else Sufficient Funds
        B->>DB: Sender balance = 5000 - 1000 = ₹4000
        B->>DB: Receiver balance = 3000 + 1000 = ₹4000
        B->>DB: Create transaction record (UUID, amount, status=SUCCESS)
        DB-->>B: Transaction saved
        B-->>F: 201 Created (transaction ID)
        F-->>U: Show success message
    end
```

### Add Funds (Top Up) Flow

```mermaid
sequenceDiagram
    participant U as User
    participant B as Backend
    participant DB as Database

    U->>B: POST /api/v1/wallets/addFunds
    B->>DB: Find wallet by IBAN
    DB-->>B: Wallet (balance: ₹2000)
    B->>DB: Update balance = 2000 + 500 = ₹2500
    B->>DB: Create transaction record
    B-->>U: 201 Created
```

### Withdraw Funds Flow

```mermaid
sequenceDiagram
    participant U as User
    participant B as Backend
    participant DB as Database

    U->>B: POST /api/v1/wallets/withdrawFunds
    B->>DB: Find wallet by IBAN
    DB-->>B: Wallet (balance: ₹2500)
    B->>B: Check: balance >= withdrawal amount?
    alt Insufficient Funds
        B-->>U: 400 Error: Insufficient funds
    else OK
        B->>DB: Update balance = 2500 - 1000 = ₹1500
        B->>DB: Create transaction record
        B-->>U: 201 Created
    end
```

---

## 🗃️ Database Design (Entity Relationship Diagram)

```mermaid
erDiagram
    USER {
        bigint id PK
        varchar first_name
        varchar last_name
        varchar username UK
        varchar email UK
        varchar password
    }

    ROLE {
        bigint id PK
        varchar type UK "ROLE_USER or ROLE_ADMIN"
    }

    USER_ROLE {
        bigint user_id FK
        bigint role_id FK
    }

    WALLET {
        bigint id PK
        varchar iban UK "Max 34 chars"
        varchar name
        decimal balance
        bigint user_id FK
    }

    TRANSACTION {
        bigint id PK
        decimal amount
        varchar description
        timestamp created_at
        uuid reference_number UK
        varchar status "PENDING / SUCCESS / ERROR"
        bigint from_wallet_id FK
        bigint to_wallet_id FK
        bigint type_id FK
    }

    TYPE {
        bigint id PK
        varchar name UK "Transfer / Payment / Shopping"
        varchar description
    }

    USER ||--o{ WALLET : "owns"
    USER }o--o{ ROLE : "has"
    USER_ROLE }o--|| USER : "maps"
    USER_ROLE }o--|| ROLE : "maps"
    WALLET ||--o{ TRANSACTION : "sends (from)"
    WALLET ||--o{ TRANSACTION : "receives (to)"
    TYPE ||--o{ TRANSACTION : "categorizes"
```

### What Each Table Stores

| Table | Purpose | Example |
|-------|---------|---------|
| **User** | Registered users | John Doe, johndoe, john@doe.com |
| **Role** | User permissions | ROLE_USER, ROLE_ADMIN |
| **User_Role** | Maps users to roles | johndoe → ROLE_USER |
| **Wallet** | Digital wallets with balance | IBAN: DE89370400440532013000, Balance: ₹5000 |
| **Transaction** | Money movement records | ₹1000 from Wallet A → Wallet B, Status: SUCCESS |
| **Type** | Transaction categories | Transfer, Payment, Shopping |

---

## 🔌 REST API Endpoints

### Authentication APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/signup` | Register a new user |
| POST | `/api/v1/auth/login` | Login and get JWT token |

### Wallet APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/wallets` | Get all wallets (paginated) |
| GET | `/api/v1/wallets/{id}` | Get wallet by ID |
| GET | `/api/v1/wallets/iban/{iban}` | Get wallet by IBAN |
| GET | `/api/v1/wallets/users/{userId}` | Get all wallets of a user |
| POST | `/api/v1/wallets` | Create a new wallet |
| POST | `/api/v1/wallets/transfer` | Transfer funds between wallets |
| POST | `/api/v1/wallets/addFunds` | Add funds to wallet (top up) |
| POST | `/api/v1/wallets/withdrawFunds` | Withdraw funds from wallet |
| PUT | `/api/v1/wallets/{id}` | Update wallet details |
| DELETE | `/api/v1/wallets/{id}` | Delete a wallet |

### Transaction APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/transactions` | Get all transactions (paginated) |
| GET | `/api/v1/transactions/{id}` | Get transaction by ID |
| GET | `/api/v1/transactions/references/{uuid}` | Get transaction by reference number |
| GET | `/api/v1/transactions/users/{userId}` | Get all transactions of a user |

> 🔒 All wallet and transaction APIs require a valid **JWT token** in the `Authorization` header.

---

## 🔐 Security Architecture

```mermaid
graph LR
    subgraph Request["Incoming HTTP Request"]
        R["Client Request"]
    end

    subgraph Filter["JWT Auth Filter"]
        F1["1. Extract JWT from header"]
        F2["2. Validate token signature"]
        F3["3. Load user from DB"]
        F4["4. Set authentication context"]
    end

    subgraph Access["Access Control"]
        A1["@PreAuthorize checks role"]
        A2["ROLE_USER or ROLE_ADMIN"]
    end

    subgraph Controller["Controller"]
        C["Process request"]
    end

    R --> F1 --> F2 --> F3 --> F4 --> A1 --> A2 --> C
```

**Security features used:**
- **JWT Authentication** — Stateless token-based auth (no sessions)
- **BCrypt Password Hashing** — Passwords are encrypted before storing
- **Role-Based Access Control** — Users have roles (USER, ADMIN)
- **CORS Configuration** — Only frontend origin (localhost:3000) is allowed
- **Stateless Sessions** — Server doesn't store session data

---

## 🖥️ Frontend Pages

```mermaid
graph TD
    Login["Login Page"] -->|"JWT Token"| Dashboard
    Signup["Signup Page"] -->|"Redirect"| Login

    subgraph Protected["Protected Routes (Need Login)"]
        Dashboard["📊 Dashboard"]
        Wallets["💳 Wallets"]
        NewWallet["➕ New Wallet"]
        AddFunds["💵 Add Funds"]
        Transfers["🔄 Transfers"]
        WalletToWallet["Wallet to Wallet"]
        WithdrawFunds["Withdraw Funds"]
        Transactions["📋 Transactions"]
    end

    Dashboard --> Wallets
    Dashboard --> Transfers
    Dashboard --> Transactions
    Wallets --> NewWallet
    Wallets --> AddFunds
    Transfers --> WalletToWallet
    Transfers --> WithdrawFunds
```

| Page | Route | What It Shows |
|------|-------|---------------|
| Login | `/login` | Username & password form |
| Signup | `/signup` | Registration form |
| Dashboard | `/` | Overview of wallets and activity |
| Wallets | `/wallets` | List of all user wallets |
| New Wallet | `/wallets/new` | Form to create a wallet |
| Add Funds | `/wallets/addFunds` | Top up wallet balance |
| Transfers | `/transfers` | Transfer money or withdraw funds |
| Transactions | `/transactions` | History of all transactions |

---

## 🐳 Docker Architecture

```mermaid
graph TB
    subgraph DockerCompose["Docker Compose (3 Containers)"]
        subgraph FE["e-wallet-frontend"]
            FrontendC["Node.js 18<br/>React App<br/>Port 3000"]
        end

        subgraph BE["e-wallet-backend"]
            BackendC["Java 17<br/>Spring Boot<br/>Port 8080"]
        end

        subgraph DBContainer["e-wallet-db"]
            DBC["PostgreSQL 14<br/>Port 5432"]
            Volume["📁 ewallet_postgres_data<br/>(Persistent Volume)"]
        end
    end

    FrontendC -->|"API calls"| BackendC
    BackendC -->|"SQL queries"| DBC
    DBC --- Volume

    User["👤 User Browser"] -->|"http://localhost:3000"| FrontendC
```

**How Docker works here:**
1. `docker-compose.yml` — Defines the PostgreSQL database + network + volume
2. `docker-compose.prod.yml` — Adds the frontend and backend containers
3. Both files are used together: `docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build`

---

## 📁 Project Folder Structure

```
e-wallet/
├── frontend/                    # React Application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/            # Login, Signup pages
│   │   │   ├── dashboard/       # Dashboard page
│   │   │   ├── wallet/          # Wallet, NewWallet, AddFunds
│   │   │   ├── transfer/        # WalletToWallet, WithdrawFunds
│   │   │   └── transaction/     # Transaction history
│   │   ├── services/            # API call functions
│   │   ├── components/          # Reusable UI components
│   │   ├── layouts/             # Dashboard layout with sidebar
│   │   └── App.js               # Route definitions
│   ├── Dockerfile               # Frontend Docker config
│   └── package.json             # Dependencies
│
├── backend/                     # Spring Boot Application
│   ├── src/main/java/.../
│   │   ├── controller/          # REST API endpoints
│   │   │   ├── AuthController        # Login & Signup
│   │   │   ├── WalletController      # Wallet CRUD + Transfers
│   │   │   └── TransactionController # Transaction queries
│   │   ├── service/             # Business logic
│   │   │   ├── AuthService           # Auth logic
│   │   │   ├── WalletService         # Wallet operations
│   │   │   └── TransactionService    # Transaction operations
│   │   ├── domain/entity/       # Database models
│   │   │   ├── User, Role, Wallet, Transaction, Type
│   │   ├── domain/enums/        # Enums (RoleType, Status)
│   │   ├── dto/                 # Request/Response objects
│   │   ├── security/            # JWT authentication
│   │   ├── validator/           # IBAN validator
│   │   ├── exception/           # Custom error handlers
│   │   └── config/              # Security, CORS, Swagger config
│   ├── src/main/resources/
│   │   ├── application.yml      # App configuration
│   │   └── db/migration/        # Flyway SQL scripts
│   ├── Dockerfile               # Backend Docker config
│   └── pom.xml                  # Maven dependencies
│
├── docker-compose.yml           # Database container
├── docker-compose.prod.yml      # Frontend + Backend containers
├── .env.properties              # Environment variables
└── README.md                    # Project documentation
```

---

## ⚙️ Tech Stack Summary

```mermaid
graph LR
    subgraph Frontend
        React["React 18"]
        MUI["Material UI"]
        AxiosLib["Axios"]
        ReactRouter["React Router v6"]
    end

    subgraph Backend
        Spring["Spring Boot 3"]
        SpringSec["Spring Security"]
        JPA["Spring Data JPA"]
        JWT["JWT (jjwt)"]
        MapStructLib["MapStruct"]
        LombokLib["Lombok"]
        FlywayLib["Flyway"]
        Swagger["Swagger/OpenAPI"]
    end

    subgraph Infra["Infrastructure"]
        PG["PostgreSQL 14"]
        Docker["Docker"]
        DockerComp["Docker Compose"]
    end

    React --> AxiosLib
    AxiosLib --> Spring
    Spring --> JPA
    JPA --> PG
    Spring --> SpringSec
    SpringSec --> JWT
    Docker --> DockerComp
```

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 | UI components and pages |
| **UI Library** | Material UI (MUI) | Pre-built styled components |
| **HTTP Client** | Axios | Make API calls to backend |
| **Routing** | React Router v6 | Page navigation |
| **Backend** | Spring Boot 3 | REST API server |
| **Security** | Spring Security + JWT | Authentication & authorization |
| **ORM** | Spring Data JPA + Hibernate | Object-to-database mapping |
| **DB Migrations** | Flyway | Auto-create/update database tables |
| **Mapping** | MapStruct | Convert between DTOs and Entities |
| **Boilerplate** | Lombok | Auto-generate getters, setters, constructors |
| **API Docs** | Swagger (springdoc-openapi) | Interactive API documentation |
| **Database** | PostgreSQL 14 | Store all application data |
| **Containerization** | Docker + Docker Compose | Run everything with one command |

---

## 🧪 IBAN Validation — How It Works

The app uses the **Modulo 97 algorithm** (ISO 7064) to validate IBAN numbers:

```mermaid
graph TD
    A["Input IBAN: DE89370400440532013000"] --> B["Step 1: Move first 4 chars to end<br/>370400440532013000DE89"]
    B --> C["Step 2: Replace letters with numbers<br/>D=13, E=14<br/>37040044053201300013 14 89"]
    C --> D["Step 3: Calculate number MOD 97"]
    D --> E{Result = 1?}
    E -->|Yes| F["✅ Valid IBAN"]
    E -->|No| G["❌ Invalid IBAN"]
```

**Example valid IBAN for testing:** `DE89370400440532013000`

---

## 📊 Request/Response Flow Example

### Creating a New Wallet

**Request:**
```json
POST /api/v1/wallets
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...

{
    "iban": "DE89370400440532013000",
    "name": "My Savings Wallet",
    "balance": 5000.00,
    "userId": 1
}
```

**Response:**
```json
HTTP 201 Created

{
    "id": 1
}
```

### Transferring Money

**Request:**
```json
POST /api/v1/wallets/transfer
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...

{
    "amount": 1000.00,
    "description": "Payment for dinner",
    "fromWalletIban": "DE89370400440532013000",
    "toWalletIban": "GB29NWBK60161331926819",
    "typeId": 1
}
```

**Response:**
```json
HTTP 201 Created

{
    "id": 5
}
```

---

## 🔑 Pre-loaded Test Users

The database comes with 3 test users (passwords are BCrypt hashed):

| Username | Email | Role |
|----------|-------|------|
| johndoe | john@doe.com | USER |
| lindacalvin | linda@calvin.com | USER |
| jeffreytaylor | jeffrey@taylor.com | USER |

---

## 📊 Database Migration Strategy (Flyway)

Flyway automatically runs SQL scripts in order when the app starts:

```mermaid
graph LR
    V1["V1: Create all tables<br/>(user, wallet, transaction,<br/>role, type, user_role)"] --> V2["V2: Add 3 test users"]
    V2 --> V3["V3: Add roles<br/>(ROLE_USER, ROLE_ADMIN)"]
    V3 --> V4["V4: Map users to roles"]
    V4 --> V5["V5: Add transaction types<br/>(Transfer, Payment, Shopping)"]
```

**Why Flyway?**
- Database schema is version-controlled (like Git for your database)
- Tables are auto-created when the app starts — no manual SQL needed
- Safe to add new migrations without losing existing data

---

## 🎯 Key Design Patterns Used

| Pattern | Where | Why |
|---------|-------|-----|
| **MVC** | Controllers → Services → Repositories | Separates concerns cleanly |
| **DTO** | Request/Response objects | Don't expose database entities directly |
| **Repository** | JPA Repositories | Abstract database queries |
| **Builder** | `CommandResponse.builder().id(1).build()` | Clean object creation |
| **Mapper** | MapStruct (Entity ↔ DTO) | Auto-convert between objects |
| **Filter** | JWT Auth Filter | Intercept every request for auth |
| **Validator** | Custom IBAN Validator annotation | Reusable validation logic |

---

## ✅ Summary

| What | Details |
|------|---------|
| **App Type** | Digital Wallet (like Paytm/Google Pay) |
| **Frontend** | React 18 + Material UI |
| **Backend** | Spring Boot 3 + Spring Security |
| **Database** | PostgreSQL 14 |
| **Auth** | JWT Token (stateless, 1-hour expiry) |
| **Key Feature** | Wallet-to-wallet transfers with IBAN validation |
| **Deployment** | Docker Compose (3 containers) |
| **API Docs** | Swagger at /swagger-ui.html |
| **Banking Concepts** | IBAN, Balance, Transactions, Reference Numbers |
