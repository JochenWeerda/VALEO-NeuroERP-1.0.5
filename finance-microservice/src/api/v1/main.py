from fastapi import FastAPI
from src.api.v1 import llm
from src.api.v1 import system

app = FastAPI()

app.include_router(llm.router)
app.include_router(system.router) 