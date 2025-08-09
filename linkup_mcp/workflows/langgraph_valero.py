# -*- coding: utf-8 -*-
from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

from pathlib import Path

# Agentenimporte
from ..agents.code_scanner import scan_repo, save_scan
from ..agents.structure_mapper import map_architecture
from ..agents.quality_analyst import analyze_paths
from ..agents.serena_refactor import generate_playbook
from ..agents.report_generator import generate_markdown_report
from ..memory.rag_manager import RAGMemoryManager

logger = logging.getLogger(__name__)


@dataclass
class ValeroState:
    root: str
    scan: Dict[str, Any] = field(default_factory=dict)
    architecture: Dict[str, Any] = field(default_factory=dict)
    quality: List[Dict[str, Any]] = field(default_factory=list)
    playbook: Dict[str, Any] = field(default_factory=dict)
    rag_manifest: Dict[str, Any] = field(default_factory=dict)
    report_path: Optional[str] = None


def run_nodes_sequential(state: ValeroState) -> ValeroState:
    root = Path(state.root).resolve()
    artifacts_dir = root / "output" / "valero_system"
    artifacts_dir.mkdir(parents=True, exist_ok=True)

    # Scan
    state.scan = scan_repo(str(root))
    save_scan(state.scan, str(artifacts_dir / "scan.json"))

    # Architektur
    state.architecture = map_architecture(state.scan)
    (artifacts_dir / "architecture.json").write_text(
        __import__("json").dumps(state.architecture, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # Qualität
    code_paths = [f["path"] for f in state.scan.get("by_type", {}).get("code", [])]
    state.quality = analyze_paths(code_paths)
    (artifacts_dir / "quality.json").write_text(
        __import__("json").dumps(state.quality, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # Playbook
    state.playbook = generate_playbook(state.quality)
    (artifacts_dir / "playbook.json").write_text(
        __import__("json").dumps(state.playbook, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # RAG
    mm = RAGMemoryManager()
    state.rag_manifest = mm.build_index([str(root)])
    (artifacts_dir / "rag_manifest.json").write_text(
        __import__("json").dumps(state.rag_manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # Report
    report_md = generate_markdown_report(state.scan, state.architecture, state.quality, state.playbook)
    (artifacts_dir / "report.md").write_text(report_md, encoding="utf-8")
    state.report_path = str(artifacts_dir / "report.md")
    return state


def build_valero_graph() -> Any:
    """Erstellt einen LangGraph-Graphen, oder liefert Fallback-Sequenzorchestrierung."""
    try:
        from langgraph.graph import StateGraph
        from typing import TypedDict

        class GState(TypedDict):
            state: ValeroState

        graph = StateGraph(GState)

        def node_scan(data: GState) -> GState:
            st = data["state"]
            root = Path(st.root).resolve()
            artifacts_dir = root / "output" / "valero_system"
            artifacts_dir.mkdir(parents=True, exist_ok=True)
            st.scan = scan_repo(str(root))
            save_scan(st.scan, str(artifacts_dir / "scan.json"))
            return {"state": st}

        def node_arch(data: GState) -> GState:
            st = data["state"]
            root = Path(st.root).resolve()
            artifacts_dir = root / "output" / "valero_system"
            st.architecture = map_architecture(st.scan)
            (artifacts_dir / "architecture.json").write_text(
                __import__("json").dumps(st.architecture, ensure_ascii=False, indent=2), encoding="utf-8"
            )
            return {"state": st}

        def node_quality(data: GState) -> GState:
            st = data["state"]
            root = Path(st.root).resolve()
            artifacts_dir = root / "output" / "valero_system"
            code_paths = [f["path"] for f in st.scan.get("by_type", {}).get("code", [])]
            st.quality = analyze_paths(code_paths)
            (artifacts_dir / "quality.json").write_text(
                __import__("json").dumps(st.quality, ensure_ascii=False, indent=2), encoding="utf-8"
            )
            return {"state": st}

        def node_playbook(data: GState) -> GState:
            st = data["state"]
            root = Path(st.root).resolve()
            artifacts_dir = root / "output" / "valero_system"
            st.playbook = generate_playbook(st.quality)
            (artifacts_dir / "playbook.json").write_text(
                __import__("json").dumps(st.playbook, ensure_ascii=False, indent=2), encoding="utf-8"
            )
            return {"state": st}

        def node_rag(data: GState) -> GState:
            st = data["state"]
            root = Path(st.root).resolve()
            artifacts_dir = root / "output" / "valero_system"
            mm = RAGMemoryManager()
            st.rag_manifest = mm.build_index([str(root)])
            (artifacts_dir / "rag_manifest.json").write_text(
                __import__("json").dumps(st.rag_manifest, ensure_ascii=False, indent=2), encoding="utf-8"
            )
            return {"state": st}

        def node_report(data: GState) -> GState:
            st = data["state"]
            root = Path(st.root).resolve()
            artifacts_dir = root / "output" / "valero_system"
            report_md = generate_markdown_report(st.scan, st.architecture, st.quality, st.playbook)
            (artifacts_dir / "report.md").write_text(report_md, encoding="utf-8")
            st.report_path = str(artifacts_dir / "report.md")
            return {"state": st}

        graph.add_node("scan", node_scan)
        graph.add_node("arch", node_arch)
        graph.add_node("quality", node_quality)
        graph.add_node("playbook", node_playbook)
        graph.add_node("rag", node_rag)
        graph.add_node("report", node_report)

        graph.set_entry_point("scan")
        graph.add_edge("scan", "arch")
        graph.add_edge("arch", "quality")
        graph.add_edge("quality", "playbook")
        graph.add_edge("playbook", "rag")
        graph.add_edge("rag", "report")

        return graph
    except Exception:
        # Fallback: Sequenzielle Orchestrierung
        logger.info("LangGraph nicht verfügbar – nutze sequenziellen Fallback.")
        return None


def run_valero_workflow(root: str = ".") -> ValeroState:
    state = ValeroState(root=root)
    graph = build_valero_graph()
    if graph is None:
        return run_nodes_sequential(state)
    # Wenn LangGraph verfügbar ist
    res = graph.invoke({"state": state})
    return res["state"]