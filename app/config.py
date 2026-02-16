from pydantic import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Mister Banking API"
    database_url: str = "sqlite:///./bank.db"
    settlement_delay_minutes: int = 5

    class Config:
        env_file = ".env"


settings = Settings()
