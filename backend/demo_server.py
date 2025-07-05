"""
Minimaler Demo-Server ohne externe Abhängigkeiten.

Dieser Server dient zum Testen der grundlegenden Funktionalität,
wenn alle anderen Server-Varianten fehlschlagen.
"""

from fastapi import FastAPI
import time

app = FastAPI()

@app.get("/")
async def root():
    """Root-Endpunkt."""
    return {"message": "Hallo vom Demo-Server!"}

@app.get("/health")
async def health():
    """Health-Check-Endpunkt."""
    return {"status": "healthy", "timestamp": time.time()}

@app.get("/echo/{message}")
async def echo(message: str):
    """Echo-Endpunkt."""
    return {"echo": message, "timestamp": time.time()} 