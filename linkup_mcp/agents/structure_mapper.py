# -*- coding: utf-8 -*-
from __future__ import annotations

from pathlib import Path
from typing import Dict, Any, List

def build_tree(paths: List[str], root: str) -> Dict[str, Any]:
    root_p = Path(root).resolve()
    nodes: Dict[str, Dict[str, Any]] = {str(root_p): {"name": root_p.name, "path": str(root_p), "children": []}}
    for pstr in paths:
        p = Path(pstr).resolve(); parent = p.parent
        chain: List[Path] = []
        while str(parent).startswith(str(root_p)) and str(parent) not in nodes:
            chain.append(parent); parent = parent.parent
        for d in reversed(chain):
            nodes[str(d)] = nodes.get(str(d), {"name": d.name, "path": str(d), "children": []})
            parent_node = nodes.get(str(d.parent), nodes[str(root_p)])
            if nodes[str(d)] not in parent_node["children"]:
                parent_node["children"].append(nodes[str(d)])
        parent_node = nodes.get(str(p.parent), nodes[str(root_p)])
        parent_node["children"].append({"name": p.name, "path": str(p), "type": "file"})
    return nodes[str(root_p)]

def map_architecture(scan: Dict[str, Any]) -> Dict[str, Any]:
    files = scan.get("files", []); root = scan.get("root", "."); paths = [f["path"] for f in files]
    tree = build_tree(paths, root); summary = {k: len(v) for k, v in scan.get("by_type", {}).items()}
    return {"root": root, "tree": tree, "summary": summary}
