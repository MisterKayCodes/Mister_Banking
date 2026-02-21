# #COPY: Mister's Crypto Engine
import secrets
import string
import requests
from decimal import Decimal
from fastapi import HTTPException

def generate_realistic_address(coin: str) -> str:
    """Mister, this creates professional-looking blockchain addresses."""
    chars = string.ascii_lowercase + string.digits
    suffix = ''.join(secrets.choice(chars) for _ in range(32))

    if coin.upper() == "BTC":
        return f"bc1q{suffix}" # SegWit style
    elif coin.upper() == "USDT":
        return f"0x{secrets.token_hex(20)}" # ERC-20 style
    return f"mister_{suffix}"

def get_live_btc_price():
    """Fetches real-time price of BTC from the market."""
    try:
        url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
        response = requests.get(url, timeout=5)
        return Decimal(str(response.json()["bitcoin"]["usd"]))
    except:
        raise HTTPException(status_code=503, detail="Mister, the market oracle is down.")


# Add this to your app/core/crypto.py
def validate_external_address(address: str, coin: str) -> bool:
    """Mister, we verify the target looks like a real vault."""
    coin = coin.upper()
    if coin == "BTC":
        # Our generator: bc1q + 32 chars. 
        # We'll allow 30-45 to be safe for external variants.
        return address.startswith("bc1q") and 30 <= len(address) <= 60
    elif coin == "USDT":
        # Our generator: 0x + 40 hex chars (20 bytes).
        return address.startswith("0x") and len(address) == 42
    return False