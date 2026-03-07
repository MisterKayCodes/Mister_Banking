# Mister Banking System

A fully dynamic, configurable banking system split into a FastAPI backend and a React/Vite frontend. Features a god-mode admin panel, integrated Crypto Vault for BTC/USDT handling, and dynamic fee/delay/message configuration via SystemConfig.

## Tech Stack
- **Backend**: FastAPI, Pydantic v2, SQlite, SQLAlchemy ORM, Alembic
- **Frontend**: React 18, Vite, Tailwind CSS, Redux, React Router Dom
- **Security**: JWT Authentication, bcrypt password hashing, IDOR (Insecure Direct Object Reference) Protection on sensitive routes (e.g. Vault Access).

## Features
- **User Management**: Registration, JWT login, PIN creation/reset, profile viewing.
- **Crypto Vault**: Multi-asset support for BTC and USDT. Real-time balance and transaction tracking logic.
- **Transactions**: Send/receive money with dynamic fees, instant or delayed processing.
- **God-Mode Admin Panel**: Full control over accounts, transactions, fees, delays, messages.
- **Security Protocols (IDOR Protection)**: Strong validation to prevent unauthorized users from viewing or manipulating other citizens' vaults or transactions. All vault requests verify ownership against the active JWT.

## API Endpoints

### Auth (`/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login, get JWT token |
| POST | `/auth/set-pin` | Set/reset transaction PIN |
| POST | `/auth/verify-pin` | Verify transaction PIN |

### Users (`/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Get authenticated user profile |
| GET | `/users/me/transactions` | Get all user transactions |

### Accounts (`/accounts`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/accounts/` | Create new account (USDT/BTC) |
| GET | `/accounts/` | List user's accounts |
| GET | `/accounts/{id}` | Get specific account |

### Wallets & Crypto Vault (`/wallets` via DB)
*Note: Backend stores BTC/USDT in `wallets` table, verified by IDOR protection rules.*

### Transactions (`/transactions`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/transactions/` | Create transfer (instant or pending) |
| POST | `/transactions/buy-crypto` | Buy BTC or USDT instantly |
| GET | `/transactions/` | List transactions |

### Admin (`/admin`) — Requires admin role
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users` | List all users |
| PATCH | `/admin/accounts/{id}/status` | Activate/deactivate account |
| PATCH | `/admin/accounts/{id}/balance` | Adjust account balance |
| POST | `/admin/transactions/{id}/approve` | Approve pending transaction |

## Running the Application
You can use the provided `start.bat` script on Windows to automatically open both the frontend and backend servers.

```bash
# Backend (Manual)
uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload

# Frontend (Manual)
npm start
```
Swagger docs available at `/docs`.
