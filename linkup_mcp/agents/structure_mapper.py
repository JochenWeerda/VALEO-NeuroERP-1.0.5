# -*- coding: utf-8 -*-
"""
Struktur-Mapper-Agent: erzeugt eine Architektur-Baumstruktur aus dem Code-Scan.
"""
from __future__ import annotations

from pathlib import Path
from typing import Dict, Any, List, Tuple
from collections import defaultdict


def build_tree(paths: List[str], root: str) -> Dict[str, Any]:
    root_path = Path(root).resolve()
    tree: Dict[str, Any] = {"name": root_path.name, "path": str(root_path), "children": []}

    # Hilfsstruktur: Verzeichnisknoten nach Pfad
    nodes: Dict[str, Dict[str, Any]] = {str(root_path): tree}

    def get_or_create_node(dir_path: Path) -> Dict[str, Any]:
        p = str(dir_path)
        if p not in nodes:
            nodes[p] = {"name": dir_path.name, "path": p, "children": []}
        return nodes[p]

    for p_str in paths:
        p = Path(p_str).resolve()
        parent = p.parent
        # Stelle sicher, dass alle Zwischenverzeichnisse existieren
        parts: List[Path] = []
        current = parent
        while str(current).startswith(str(root_path)) and str(current) not in nodes:
            parts.append(current)
            current = current.parent
        for d in reversed(parts):
            parent_node = nodes.get(str(d.parent), tree)
            node = get_or_create_node(d)
            if node not in parent_node["children"]:
                parent_node["children"].append(node)
        # Füge die Datei als Blatt hinzu
        parent_node = nodes.get(str(parent), tree)
        parent_node["children"].append({"name": p.name, "path": str(p), "type": "file"})

    return tree


def map_architecture(scan_result: Dict[str, Any]) -> Dict[str, Any]:
    files = scan_result.get("files", [])
    root = scan_result.get("root", ".")
    paths = [f["path"] for f in files]
    tree = build_tree(paths, root)

    # Aggregate nach Typ
    by_type = scan_result.get("by_type", {})
    summary = {k: len(v) for k, v in by_type.items()}

    return {
        "root": root,
        "tree": tree,
        "summary": summary,
    }