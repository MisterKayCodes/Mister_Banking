import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "System Banking API"
    database_url: str = "sqlite:///./misterbanking.db"
    settlement_delay_minutes: int = 5
    # Bridge integration settings
    BRIDGE_SECRET_KEY: str = os.getenv("BRIDGE_SECRET_KEY", "change-me")
    FCHAIN_BRIDGE_URL: str = os.getenv("FCHAIN_BRIDGE_URL", "https://fchain.example.com/api/bridge")
    BRIDGE_CONFIRMATION_BLOCKS: int = int(os.getenv("BRIDGE_CONFIRMATION_BLOCKS", "6"))
    BRIDGE_STEP_DELAY: int = int(os.getenv("BRIDGE_STEP_DELAY", "70"))
    BANKING_BRIDGE_ENABLED: bool = os.getenv("BANKING_BRIDGE_ENABLED", "true").lower() == "true"

    class Config:
        env_file = ".env"

settings = Settings()
