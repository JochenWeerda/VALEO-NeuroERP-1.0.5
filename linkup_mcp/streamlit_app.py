"""
Streamlit Dashboard für GENXAIS-Zyklus Visualisierung.
"""

import streamlit as st
from motor.motor_asyncio import AsyncIOMotorClient
import yaml
from typing import Dict, Any, List, Optional
import plotly.graph_objects as go
from pathlib import Path
from pymongo import MongoClient

# MongoDB Verbindung (synchron für Streamlit)
client = MongoClient("mongodb://localhost:27017")
db = client.genxais

class GENXAISMonitor:
    def __init__(self):
        self.phases = ["VAN", "PLAN", "CREATE", "IMPLEMENTATION", "REFLEKTION"]
        self.phase_colors = {
            "VAN": "#1f77b4",
            "PLAN": "#ff7f0e",
            "CREATE": "#2ca02c",
            "IMPLEMENTATION": "#d62728",
            "REFLEKTION": "#9467bd"
        }
        
    def get_system_state(self) -> Dict[str, Any]:
        """Hole aktuellen Systemstatus aus MongoDB"""
        state = db.system_state.find_one({"type": "version"})
        return state or {
            "current_version": "v1.2",
            "next_version": "v1.3",
            "cycle_status": {"current": "REFLEKTION (v1.2)", "next": "VAN (v1.3)", "progress": 0}
        }
        
    def get_current_phase(self) -> Dict[str, Any]:
        """Hole Details der aktuellen Phase"""
        phase = db.phases.find_one({"status": "pending"})
        return phase or {}
        
    def get_artifacts(self, version: str) -> List[Dict[str, Any]]:
        """Hole alle Artefakte für eine Version"""
        return list(db.artifacts.find({"version": version}))
        
    def create_phase_progress_chart(self, current_phase: str, progress: float) -> go.Figure:
        """Erstelle Fortschrittsdiagramm für Phasen"""
        phases = self.phases
        colors = [self.phase_colors[phase] for phase in phases]
        current_idx = phases.index(current_phase)
        
        fig = go.Figure(go.Indicator(
            mode = "gauge+number",
            value = progress,
            domain = {'x': [0, 1], 'y': [0, 1]},
            gauge = {
                'axis': {'range': [0, 100]},
                'bar': {'color': colors[current_idx]},
                'steps': [
                    {'range': [0, 100], 'color': 'lightgray'}
                ]
            }
        ))
        
        fig.update_layout(
            title=f"Fortschritt: {current_phase}",
            height=300
        )
        
        return fig

    def get_agent_status(self, phase: str) -> Dict[str, str]:
        """Hole Status aller Agents für eine Phase"""
        if phase == "REFLEKTION":
            return {
                "ReviewerAgent": "⏳ Aktiv - Validierung der Phasen-Outputs",
                "MetricsAgent": "🔄 Warte auf Review",
                "FeedbackAgent": "🔄 Warte auf Review",
                "SummaryAgent": "🔄 Warte auf Metrics & Feedback"
            }
        return {}

    def get_pipeline_status(self) -> Dict[str, Any]:
        """Hole Status aller Pipelines"""
        return db.pipelines.find_one({"status": "active"}) or {
            "active_pipelines": [],
            "completed_pipelines": [],
            "pending_pipelines": ["review", "metrics", "feedback", "synthesis"]
        }

@st.cache_resource
def get_monitor():
    return GENXAISMonitor()

def render_header(monitor: GENXAISMonitor):
    """Render den Header-Bereich"""
    system_state = monitor.get_system_state()
    
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Aktuelle Version", system_state["current_version"])
    with col2:
        st.metric("Aktuelle Phase", system_state["cycle_status"]["current"])
    with col3:
        st.metric("Nächste Phase", system_state["cycle_status"]["next"])
    
    return system_state

def render_progress(monitor: GENXAISMonitor, current_phase: Dict[str, Any]):
    """Render den Fortschrittsbereich"""
    st.subheader("Pipeline Fortschritt")
    progress_chart = monitor.create_phase_progress_chart(
        current_phase.get("phase", "REFLEKTION"),
        current_phase.get("progress", 0)
    )
    st.plotly_chart(progress_chart, use_container_width=True)

def render_agent_status(monitor: GENXAISMonitor, phase: str):
    """Render den Agent-Status-Bereich"""
    st.subheader("Agent Status")
    agent_col1, agent_col2 = st.columns(2)
    
    agents = monitor.get_agent_status(phase)
    for idx, (agent, status) in enumerate(agents.items()):
        with agent_col1 if idx % 2 == 0 else agent_col2:
            st.info(f"{agent}: {status}")

def render_artifacts(monitor: GENXAISMonitor, version: str):
    """Render den Artefakte-Bereich"""
    st.subheader("Artefakte & Dokumente")
    artifacts = monitor.get_artifacts(version)
    
    if artifacts:
        for artifact in artifacts:
            with st.expander(f"📁 {artifact['phase']} Phase Artefakte"):
                for file_type, file_name in artifact["expected_files"].items():
                    st.code(f"{file_type}: {file_name}")
                    file_path = Path(f"./artifacts/{file_name}")
                    if file_path.exists():
                        with open(file_path, "rb") as f:
                            st.download_button(
                                f"Download {file_name}",
                                data=f,
                                file_name=file_name
                            )

def render_sidebar(system_state: Dict[str, Any]):
    """Render die Sidebar"""
    st.sidebar.title("System Information")
    st.sidebar.info(
        f"""
        **GENXAIS Zyklus**
        - Aktuelle Version: {system_state['current_version']}
        - Nächste Version: {system_state['next_version']}
        
        **Archiv**
        - Pfad: ./archive/GENXAIS_{system_state['current_version']}/
        - Status: Aktiv
        """
    )

def main():
    st.set_page_config(
        page_title="GENXAIS Cycle Monitor",
        page_icon="🔄",
        layout="wide"
    )
    
    st.title("🔄 GENXAIS Cycle Monitor")
    
    # Initialisiere Monitor
    monitor = get_monitor()
    
    try:
        # Render Hauptkomponenten
        system_state = render_header(monitor)
        current_phase = monitor.get_current_phase()
        
        render_progress(monitor, current_phase)
        render_agent_status(monitor, current_phase.get("phase", ""))
        render_artifacts(monitor, system_state["current_version"])
        render_sidebar(system_state)
        
        # Auto-Refresh
        if st.sidebar.button("🔄 Aktualisieren"):
            st.rerun()
            
    except Exception as e:
        st.error(f"Fehler beim Laden der Daten: {str(e)}")
        st.info("Versuchen Sie die Seite zu aktualisieren oder prüfen Sie die MongoDB-Verbindung.")

if __name__ == "__main__":
    main() 