from fastapi import FastAPI

app = FastAPI(title="Mister Banking API")


@app.get("/")
def health_check():
    return {"status": "alive"}
