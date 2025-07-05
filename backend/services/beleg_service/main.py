from fastapi import FastAPI
from .api import router

app = FastAPI(title="Beleg-Microservice", version="0.1.0")

app.include_router(router, prefix="/api/v1") 