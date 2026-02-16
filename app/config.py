from pydantic import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Mister Banking API"
    database_url: str = "sqlite:///./misterbanking.db"
    settlement_delay_minutes: int = 5

    class Config:
        env_file = ".env"


settings = Settings()
