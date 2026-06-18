# #COPY: System's Crypto Engine
import secrets
import string
import requests
from decimal import Decimal
from fastapi import HTTPException

def generate_realistic_address(coin: str) -> str:
    """this creates professional-looking blockchain addresses."""
    chars = string.ascii_lowercase + string.digits
    suffix = ''.join(secrets.choice(chars) for _ in range(32))

    if coin.upper() == "BTC":
        return f"bc1q{suffix}" # SegWit style
    elif coin.upper() == "USDT":
        return f"0x{secrets.token_hex(20)}" # ERC-20 style
    return f"administrator_{suffix}"

def get_live_btc_price():
    """Fetches real-time price of BTC from the market."""
    try:
        url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
        response = requests.get(url, timeout=5)
        return Decimal(str(response.json()["bitcoin"]["usd"]))
    except:
        raise HTTPException(status_code=503, detail="the market oracle is down.")


# Add this to your app/core/crypto.py
def validate_external_address(address: str, coin: str) -> bool:
    """we verify the target looks like a real vault."""
    coin = coin.upper()
    if coin == "BTC":
        # BTC addresses: bc1q (native segwit), 1 (legacy), 3 (segwit)
        return (address.startswith("bc1q") and 30 <= len(address) <= 60) or \
               (address.startswith("1") and 25 <= len(address) <= 34) or \
               (address.startswith("3") and 25 <= len(address) <= 34)
    elif coin == "USDT":
        # ERC20: 0x + 40 hex chars (42 total)
        # TRC20: T + 33 chars (34 total)
        if address.startswith("0x") and len(address) == 42:
            return True
        if address.startswith("T") and len(address) == 34:
            return True
        return False
    return False