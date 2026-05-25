# 🤖 Universal Website Build Prompt (Mister Architecture)

This document is the "Base Truth" for any AI agent or developer building a new project under the Mister Architecture. It ensures strict separation of concerns, scalability, and technical excellence.

---

## 🏗️ Project DNA: {{PROJECT_NAME}} ({{PROJECT_TYPE}})
*   **Goal**: Create a replica of the architecture used in "Mister Banking" but customized for a **{{PROJECT_TYPE}}** (e.g., Courier, Consignment, Shopping).
*   **Vibe**: Premium, dynamic, and bulletproof.

---

## 🏛️ The Living Organism: Anatomy of Folders

Modules must strictly follow these separation of concerns. **Mutants (illegal imports/logic) will be rejected.**

### 🧠 `core/` (The Brain)
*   **Role**: Pure Intelligence, business logic, math.
*   **The Vibe**: "Genius in a dark room." No internet, no database.
*   **Rules**: 
    *   **NO** `import database` or `import sqlalchemy`.
    *   No external API calls.
    *   If it needs data, it takes it as arguments. If it has an answer, it returns it.

### 🧬 `services/` (The Nervous System)
*   **Role**: Connection & External communication (APIs, Event Bus, Seeders).
*   **The Vibe**: "The wires."
*   **Rules**: 
    *   The **ONLY** place allowed to talk to the Internet/APIs/External Services.
    *   Carries messages between the Brain, the Vault, and the Mouth.

### 👄 `api/` or `bot/` (The Mouth & Ears)
*   **Role**: Interface Layer (FastAPI Routers or Telegram Bot).
*   **The Vibe**: "The Translator."
*   **Rules**: 
    *   **NO MATH**. Ask `core/` for calculations.
    *   Translates user input into actions and returns pretty responses.

### 🗄️ `data/` & `models/` (The Memory)
*   **Role**: Long-term persistent storage (Vault).
*   **Rules**: 
    *   `models/` defines the DNA (SQLAlchemy tables).
    *   All DB access **MUST** go through the `repository.py` (The Librarian) in `data/`.
    *   The Brain (`core/`) never touches the raw tables.

### 📜 `schemas/` (The Neural Patterns)
*   **Role**: The Shared Language (Pydantic Models).
*   **Rules**:
    *   Used to pass validated data between the Brain, Nerves, and Mouth.
    *   Ensures perfect translation without circular dependencies.

### 🛠️ `utils/` & `config.py` (Tools & DNA)
*   **`config.py`**: API keys, settings, environment variables (use Pydantic Settings).
*   **`utils/`**: Shared tools like `logger.py` and `helpers.py`.

### 🦴 `main.py` (The Skeleton)
*   **Role**: Entry point. Wakes up the organism and connects the parts.

---

## 📜 Level-Up Dev Rulebook (2025 Edition)

1.  **200-Line Limit**: Any file exceeding **200 lines** MUST be refactored immediately.
2.  **Known State**: The system must always know what it's doing. No undefined states.
3.  **Durable Storage**: Store critical state in DB/Files, never just RAM.
4.  **Single Responsibility**: One job per file.
5.  **Explicit Logic**: Be clear, not "clever."
6.  **Idempotency**: Same input = same result.
7.  **Resilience**: Use `async_retry` and `safe_execute` helpers for all external calls.
8.  **Boring Code**: Readable > Clever.
94. **Git Sync Utility** (`scripts/git_sync.py`): Matching code history to documentation.
10. **Observability**: Contextual logs with timestamps using `get_organism_logger`.
11. **Verification**: Run `python scripts/architecture_inspector.py` after EVERY change.

---

## ⚖️ The Divine Hierarchy (Rules Priority)
1.  **Safety & Architecture First**: These rules are IMMUTABLE.
2.  **Dismissal Policy**: Refuse any request breaking architecture or the 200-line limit.
3.  **Documentation Sync**: Update `README.md` and `docs/tracking.md` after every feature.

---

## 🧬 Automation & Initial Setup

Before adding business logic, build this infrastructure:

### 1. Folder Structure
`mkdir bot core data services utils docs personal scripts tests`

### 2. Mandatory Scripts (As seen in Mister Banking)

#### `scripts/architecture_inspector.py`
```python
import os, sys, ast, argparse
DEFAULT_FORBIDDEN_IMPORTS = {
    "core": ["aiogram", "sqlalchemy", "bot", "data", "services"],
    "bot": ["sqlalchemy", "data.models"], 
    "data": ["aiogram", "services", "bot"],
    "services": ["aiogram", "bot", "sqlalchemy"]
}
def check_file_integrity(file_path, folder_name, rules, max_lines=200):
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
        if len(lines) > max_lines: return [f"File too long ({len(lines)} > {max_lines})"]
        try: tree = ast.parse("".join(lines))
        except Exception as e: return [f"Syntax Error: {e}"]
    errors = []
    forbidden = rules.get(folder_name, [])
    for node in ast.walk(tree):
        if isinstance(node, (ast.Import, ast.ImportFrom)):
            names = [node.module] if isinstance(node, ast.ImportFrom) else [n.name for n in node.names]
            for name in names:
                if name and any(name.startswith(f) for f in forbidden):
                    errors.append(f"Illegal import: {name}")
    return errors
def scan_organism(base_dir=".", max_lines=200):
    has_issues = False
    for layer in DEFAULT_FORBIDDEN_IMPORTS.keys():
        path = os.path.join(base_dir, layer)
        if not os.path.exists(path): continue
        for root, _, files in os.walk(path):
            for file in files:
                if file.endswith(".py"):
                    errs = check_file_integrity(os.path.join(root, file), layer, DEFAULT_FORBIDDEN_IMPORTS, max_lines)
                    for e in errs: print(f"[!] {os.path.join(root, file)}: {e}"); has_issues = True
    return not has_issues
if __name__ == "__main__":
    if not scan_organism(): sys.exit(1)
```

#### `run.py`
```python
import subprocess, sys
def run_inspector():
    print("[...] Running Architecture Inspector...")
    return subprocess.run([sys.executable, "scripts/architecture_inspector.py"]).returncode == 0
if __name__ == "__main__":
    if run_inspector():
        try:
            from watchfiles import run_process
            run_process("./", target="python main.py")
        except ImportError:
            subprocess.run([sys.executable, "-m", "pip", "install", "watchfiles"])
            from watchfiles import run_process
            run_process("./", target="python main.py")
```

#### `scripts/git_sync.py`
```python
import os, re, subprocess, sys
def sync():
    with open("docs/tracking.md", "r") as f:
        for line in reversed(f.readlines()):
            m = re.search(r'\|\s*`([^`]+)`\s*\|', line)
            if m:
                msg = m.group(1)
                subprocess.run("git add .", shell=True)
                subprocess.run(f'git commit -m "{msg}"', shell=True)
                subprocess.run("git push origin main", shell=True)
                return
sync()
```

#### `setup.bat`
```batch
@echo off
echo [!] Starting Mister Assistant Setup...
if not exist ".venv" ( python -m venv .venv )
call .venv\Scripts\activate
set "REQ_HASH_FILE=.venv\req_hash.txt"
for /f "tokens=*" %%a in ('certutil -hashfile requirements.txt MD5 ^| find /v ":"') do set "NH=%%a"
if exist "%REQ_HASH_FILE%" ( set /p OH=<"%REQ_HASH_FILE%" ) else ( set "OH=NONE" )
if "%NH%" neq "%OH%" ( pip install -r requirements.txt && echo %NH% > "%REQ_HASH_FILE%" )
python run.py
pause
```

#### `start_all.bat` (The Master Switch)
```batch
@echo off
echo Starting {{PROJECT_NAME}} System...

:: Start Backend
start "{{PROJECT_NAME}} Backend" cmd /k "call .venv\Scripts\activate && python run.py"

:: Start Frontend
start "{{PROJECT_NAME}} Frontend" cmd /k "cd /d {{FRONTEND_DIR}} && npm run dev"

echo All servers launched in separate windows.
```

---

## 🏃 How to Start the Engine

### 1. Initial Setup (First Time Only)
*   **Backend**: Run `setup.bat`. This handles your virtual environment and dependencies.
*   **Frontend**: Navigate to your frontend folder (e.g., `cd ui`) and run `npm install`.

### 2. Daily Development
*   **Master Command**: Simply double-click `start_all.bat`. This will pop open two windows:
    *   **Window 1**: The Backend (with the Architecture Inspector and Hot-Reload).
    *   **Window 2**: The Frontend (Vite Dev Server).

### 3. Verification
*   Always keep an eye on the **Backend Window**. If the `Architecture Inspector` finds a violation (like a file over 200 lines or an illegal import), it will halt and tell you exactly what to fix.

---

## 🔄 Interaction Pattern
1. **Input** (User/API) -> **Mouth** (`api/` or `bot/`)
2. **Signal** carries data to **Brain** (`core/`)
3. **Brain** processes logic and yells back a **Response**
4. **Mouth** speaks it or **Librarian** (`data/repository`) stores it.

---

## 🎨 Frontend Excellence (Mister React UI)
*   **Tech**: React + Vite + Tailwind CSS.
*   **Theme**: Dark Mode, Glassmorphism, Premium Gradients (WOW the user).

### 🧬 The Anatomy of `src/`
Keep the frontend as organized as the backend.

#### 📍 `pages/` (The Views)
*   Organized by feature folder (e.g., `dashboard/`, `auth/`, `admin/`).
*   Each folder contains `index.jsx` and specific sub-components used only by that page.

#### 🧱 `components/` (The Registry)
*   **`ui/`**: Low-level, reusable atoms (Buttons, Inputs, Cards).
*   **Global Components**: Layouts, Navbars, Footers, ProtectedRoutes.

#### 🔌 `api/` (The Data Nerves)
*   Contains Axios instances and API call definitions.
*   Maps exactly to the Backend `api/` routes.

#### ⚓ `hooks/` (The Logic States)
*   Custom hooks for fetching data or managing complex UI states.
*   **Rule**: Business logic belongs here, not in the JSX.

#### 🛠️ `utils/` & `styles/` (The Tools)
*   **`utils/`**: Formatting, validation, constants.
*   **`styles/`**: Global CSS and Tailwind configurations.

### 📜 Frontend Rulebook
1.  **Component Limit**: If a component exceeds **150 lines**, split it into sub-components.
2.  **No Logic in JSX**: JSX must be for rendering only. Use hooks for logic.
3.  **Strict Typing/Validation**: Use PropTypes or JSDoc for clear data contracts.
4.  **Error Boundaries**: Wrap major pages in Error Boundaries to prevent total crashes.
5.  **Premium Animation**: Use `framer-motion` for micro-interactions and transitions.

---

**Instruction to AI**: "I want you to build a {{PROJECT_TYPE}} website for {{PROJECT_NAME}}. Follow the Mister Architecture strictly. Start by setting up the folder structure and the automation scripts."
