#!/usr/bin/env python3
"""
Vereinfachter VAN Phase Server für VALEO-NeuroERP
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
from datetime import datetime
import uvicorn

app = FastAPI(
    title="VALEO-NeuroERP VAN Phase API",
    description="Vereinfachte VAN Phase API für Entwicklung und Testing",
    version="2.0.0"
)

class VANState(BaseModel):
    """VAN Phase Zustand"""
    cycle_id: str = Field(description="ID des aktuellen Zyklus")
    stage: str = Field(description="Aktuelle Stufe (vision, analysis, next_steps)")
    status: str = Field(description="Aktueller Status")
    vision_data: Dict[str, Any] = Field(default_factory=dict, description="Vision-Daten")
    analysis_data: Dict[str, Any] = Field(default_factory=dict, description="Analyse-Daten")
    next_steps_data: Dict[str, Any] = Field(default_factory=dict, description="Next-Steps-Daten")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Metadaten")
    error: Optional[str] = Field(default=None, description="Fehler (falls vorhanden)")

class StartVANCycleRequest(BaseModel):
    """Request zum Starten eines VAN Zyklus"""
    cycle_id: str

class StartVANCycleResponse(BaseModel):
    """Response zum Starten eines VAN Zyklus"""
    cycle_id: str
    state: VANState

# In-Memory Speicher für VAN Zyklen
van_cycles: Dict[str, VANState] = {}

def create_initial_van_state(cycle_id: str) -> VANState:
    """Erstellt einen initialen VAN Zustand"""
    return VANState(
        cycle_id=cycle_id,
        stage="vision",
        status="running",
        vision_data={
            "requirements": [
                "KI-gestützte ERP-Funktionen",
                "Moderne UI/UX mit Material-UI und Ant Design",
                "Skalierbare Microservice-Architektur",
                "Real-time Datenverarbeitung",
                "Integrierte Workflow-Automatisierung"
            ],
            "stakeholders": [
                "Entwicklungsteam",
                "Endbenutzer",
                "Management",
                "IT-Administratoren",
                "Business Analysten"
            ],
            "constraints": [
                "Performance: < 2s Antwortzeit",
                "Sicherheit: ISO 27001 Compliance",
                "Skalierbarkeit: 1000+ gleichzeitige Benutzer",
                "Verfügbarkeit: 99.9% Uptime",
                "Compliance: DSGVO, SOX"
            ],
            "objectives": [
                "Automatisierung von 80% der Routineaufgaben",
                "Reduzierung der Datenverarbeitungszeit um 60%",
                "Verbesserung der Benutzerfreundlichkeit",
                "Integration mit bestehenden Systemen"
            ]
        },
        analysis_data={},
        next_steps_data={},
        metadata={
            "created_at": datetime.now().isoformat(),
            "framework_version": "2.0",
            "phase": "VAN",
            "created_by": "system"
        },
        error=None
    )

@app.get("/")
async def root():
    """Root-Endpunkt"""
    return {
        "message": "VALEO-NeuroERP VAN Phase API",
        "version": "2.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Health Check"""
    return {
        "status": "healthy",
        "active_cycles": len(van_cycles),
        "timestamp": datetime.now().isoformat(),
        "service": "VAN Phase API"
    }

@app.post("/api/v1/van/cycles", response_model=StartVANCycleResponse)
async def start_cycle(request: StartVANCycleRequest):
    """Startet einen neuen VAN Zyklus"""
    try:
        cycle_id = request.cycle_id
        
        # Prüfen ob Zyklus bereits existiert
        if cycle_id in van_cycles:
            raise HTTPException(
                status_code=400,
                detail=f"VAN Zyklus mit ID {cycle_id} existiert bereits"
            )
        
        # Initialen Zustand erstellen
        state = create_initial_van_state(cycle_id)
        van_cycles[cycle_id] = state
        
        print(f"✅ VAN Zyklus gestartet: {cycle_id}")
        
        return StartVANCycleResponse(
            cycle_id=cycle_id,
            state=state
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Starten des VAN Zyklus: {str(e)}"
        )

@app.get("/api/v1/van/cycles/{cycle_id}", response_model=VANState)
async def get_cycle_status(cycle_id: str):
    """Gibt den Status eines VAN Zyklus zurück"""
    try:
        if cycle_id not in van_cycles:
            raise HTTPException(
                status_code=404,
                detail=f"VAN Zyklus mit ID {cycle_id} nicht gefunden"
            )
        
        return van_cycles[cycle_id]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Abrufen des VAN Zyklus: {str(e)}"
        )

@app.get("/api/v1/van/cycles", response_model=List[VANState])
async def list_cycles():
    """Listet alle aktiven VAN Zyklen auf"""
    try:
        return list(van_cycles.values())
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Auflisten der VAN Zyklen: {str(e)}"
        )

@app.put("/api/v1/van/cycles/{cycle_id}/stage")
async def update_cycle_stage(cycle_id: str, stage: str):
    """Aktualisiert die Stufe eines VAN Zyklus"""
    try:
        if cycle_id not in van_cycles:
            raise HTTPException(
                status_code=404,
                detail=f"VAN Zyklus mit ID {cycle_id} nicht gefunden"
            )
        
        valid_stages = ["vision", "analysis", "next_steps", "completed"]
        if stage not in valid_stages:
            raise HTTPException(
                status_code=400,
                detail=f"Ungültige Stufe. Erlaubte Stufen: {valid_stages}"
            )
        
        van_cycles[cycle_id].stage = stage
        if stage == "completed":
            van_cycles[cycle_id].status = "completed"
        
        return {"message": f"Stufe erfolgreich auf '{stage}' aktualisiert"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Aktualisieren der Stufe: {str(e)}"
        )

@app.delete("/api/v1/van/cycles/{cycle_id}")
async def delete_cycle(cycle_id: str):
    """Löscht einen VAN Zyklus"""
    try:
        if cycle_id not in van_cycles:
            raise HTTPException(
                status_code=404,
                detail=f"VAN Zyklus mit ID {cycle_id} nicht gefunden"
            )
        
        del van_cycles[cycle_id]
        return {"message": f"VAN Zyklus {cycle_id} erfolgreich gelöscht"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Löschen des VAN Zyklus: {str(e)}"
        )

if __name__ == "__main__":
    print("🚀 Starte VALEO-NeuroERP VAN Phase Server...")
    print("📡 Server läuft auf: http://localhost:8000")
    print("📚 API Dokumentation: http://localhost:8000/docs")
    print("=" * 50)
    
    uvicorn.run(
        "simple_van_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 