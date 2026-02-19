# Mister Banking API

A fully dynamic, configurable banking system built with FastAPI, PostgreSQL, and SQLAlchemy. Features a god-mode admin panel, BTC/USDT crypto support, and dynamic fee/delay/message configuration via SystemConfig.

## Features

- **User Management**: Registration, JWT login, PIN creation/reset, profile viewing
- **Multi-Account Support**: Users can hold multiple USDT and BTC accounts
- **Transactions**: Send/receive money with dynamic fees, instant or delayed processing
- **Crypto Purchases**: Instantly buy BTC or USDT
- **Transaction States**: pending → processing → success → reversed/blocked
- **Transaction Receipts**: Reference IDs, timestamps, amounts, fees
- **God-Mode Admin Panel**: Full control over accounts, transactions, fees, delays, messages
- **Dynamic SystemConfig**: No hardcoded values — all fees, delays, and messages are configurable
- **Audit Trail**: Every admin action is logged with background tasks

## Tech Stack

- **FastAPI** with Pydantic v2 validation
- **PostgreSQL** with SQLAlchemy ORM
- **Alembic** for database migrations
- **JWT Authentication** via python-jose
- **bcrypt** password hashing via passlib

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

### Transactions (`/transactions`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/transactions/` | Create transfer (instant or pending) |
| POST | `/transactions/buy-crypto` | Buy BTC or USDT instantly |
| GET | `/transactions/` | List transactions |
| GET | `/transactions/{id}/receipt` | Get transaction receipt |

### Admin (`/admin`) — Requires admin role
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users` | List all users |
| PATCH | `/admin/accounts/{id}/status` | Activate/deactivate account |
| PATCH | `/admin/accounts/{id}/balance` | Adjust account balance |
| POST | `/admin/transactions/{id}/approve` | Approve pending transaction |
| POST | `/admin/transactions/{id}/block` | Block transaction, refund sender |
| POST | `/admin/transactions/{id}/reverse` | Reverse successful transaction |
| GET | `/admin/transactions` | List all transactions (filterable) |
| GET | `/admin/config` | View all system config values |
| PUT | `/admin/config/{key}` | Update a config value |
| GET | `/admin/audit-logs` | View admin audit trail |

## SystemConfig Defaults (Auto-Seeded)

| Key | Default Value | Description |
|-----|---------------|-------------|
| `transfer_fee_percent` | 1.0 | Fee % for standard transfers |
| `instant_transfer_fee_percent` | 2.0 | Fee % for instant transfers |
| `transaction_delay_minutes` | 5 | Processing delay in minutes |
| `blocked_message` | "Transaction temporarily blocked" | Message for blocked transactions |
| `reversal_message` | "Transaction reversed by admin" | Message for reversed transactions |

## Running

```bash
uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
```

Swagger docs available at `/docs`.
