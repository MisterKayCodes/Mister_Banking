from fastapi import FastAPI
from app.data.database import Base, engine
from app.api.user_routes import router as user_router

app = FastAPI(title="Mister Banking API")

Base.metadata.create_all(bind=engine)

app.include_router(user_router)
