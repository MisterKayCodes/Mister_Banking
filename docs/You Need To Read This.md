# You Need To Read This: The Power of Tiny Helpers

## Why You Exhaust AI (And How To Stop)

When you ask an AI to write or fix code, every single character you send—and every character it reads—costs "tokens." Think of tokens as the AI's short-term memory limit. 

When you paste a 1,000-line file into a chat and say "fix the withdrawal bug," the AI has to load the *entire* file into its brain. It reads your database imports, your UI text, your math equations, and your error handlers all at once. By the time it finds the bug on line 850, it is mentally exhausted. This leads to:
1. **Hallucinations:** It forgets what was at the top of the file and writes code that breaks existing rules.
2. **Messy Code:** It takes shortcuts because its memory is full.
3. **High Costs:** You burn through your API limits rapidly.

**The Solution:** Tiny, isolated helper functions.

If your core logic is hidden inside a helper function with a clear name (e.g., `calculate_risk_exposure()`), the AI doesn't need to read the math to understand what the code does. It just reads the name, trusts that it works, and moves on. You save tokens, and the AI stays focused.

---

## 🏛️ Theory: The Living Organism Architecture (v2.0)

To keep the AI focused and your code scalable, we use the "Living Organism" architecture. This ensures strict boundaries. When boundaries are strict, you only ever need to ask the AI to modify *one specific organ* at a time, saving massive amounts of tokens.

### 🧠 core/ (The Brain)
**Pure Intelligence & Domain Logic.**
The Brain is a math genius locked in a dark room. It has no Wi-Fi, it cannot open a database, and it does not know what Telegram is. It only takes raw numbers, calculates the truth, and returns an answer. If you ever import `aiogram` or `sqlalchemy` here, you have created a tumor.

### 🧬 services/ (The Nervous System)
**Connection & Orchestration.**
The Nerves are the only things allowed to touch the chaotic outside world. They talk to Binance, they talk to Stripe, they fetch data from the Internet, and they pass clean, structured data (via Schemas) back to the Brain.

### 👄 bot/ (The Mouth & Ears)
**The Interface (Telegram/UI).**
The Mouth only speaks and listens. It turns a user's Telegram message into a Schema, hands it to the Brain, waits for an answer, and translates that answer back into a pretty message with emojis. **The Mouth never does math.** If you are calculating lots or pips inside a router, you are doing it wrong.

### 🗄️ data/ (The Memory)
**The Vault & The Librarian.**
The raw data tables live here. No one touches the tables directly except the Librarian (`repository.py`). If the Brain or the Mouth needs information, they hand a standard request format to the Librarian, and the Librarian hands them the book.

### 📜 schemas/ (The Neural Patterns)
**The Shared Language.**
Because the Brain, Mouth, and Librarian aren't allowed to touch each other directly, they use standard Pydantic models (Schemas) to pass information back and forth. This ensures perfect translation without messy dependencies.

---

## 🛠️ The Code: `utils/helpers.py`

When building complex systems (especially Telegram bots making external API calls), you will write the same "safety" code repeatedly. Instead of copy-pasting try/except blocks and wasting the AI's tokens reading them, put them in a dedicated `helpers.py`.

Here is the *only* code you need to maintain your organism's health and make debugging incredibly simple:

```python
# utils/helpers.py
import logging
import asyncio
from typing import Callable, Any
from functools import wraps

# ---------------------------------------------------------
# 1. The Organism Logger
# Stop guessing where crashes happen. This helper explicitly
# names the organ that is speaking to the terminal.
# ---------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="[%(levelname)s] [%(name)s] %(message)s"
)

def get_organism_logger(organ_name: str) -> logging.Logger:
    """
    Usage: 
    log = get_organism_logger("Brain.Calculators")
    log.info("Risk calculation complete.")
    """
    return logging.getLogger(organ_name)


# ---------------------------------------------------------
# 2. Add Resiliency: The Async Retry Nerve
# Telegram and Binance APIs drop connections constantly.
# Instead of writing try/except 50 times, wrap your functions 
# with this helper to automatically retry before failing.
# ---------------------------------------------------------
def async_retry(max_attempts: int = 3, delay_seconds: int = 2):
    """
    Usage:
    @async_retry(max_attempts=3)
    async def fetch_binance_price(...):
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            attempts = 0
            while attempts < max_attempts:
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    attempts += 1
                    log = get_organism_logger("NerveSystem.Retry")
                    log.warning(f"Attempt {attempts} failed in {func.__name__}: {str(e)}")
                    if attempts == max_attempts:
                        raise e
                    await asyncio.sleep(delay_seconds)
        return wrapper
    return decorator


# ---------------------------------------------------------
# 3. The Graceful Fallback (Pain Sensor Manager)
# When the bot crashes, don't let it freeze. Log the error 
# properly and return a safe default schema so the Mouth 
# can tell the user what went wrong without breaking.
# ---------------------------------------------------------
def safe_execute(default_return: Any = None):
    """
    Usage:
    @safe_execute(default_return=False)
    def calculate_complex_math(...):
    """
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                log = get_organism_logger("PainSensor")
                log.error(f"Critical failure in {func.__name__}: {str(e)}", exc_info=True)
                return default_return
        return wrapper
    return decorator
```

By keeping these theoretical rules strict and moving repetitious boilerplate code into `helpers.py`, you allow the AI to read far less code while still maintaining total control over your highly scalable bot architecture.
