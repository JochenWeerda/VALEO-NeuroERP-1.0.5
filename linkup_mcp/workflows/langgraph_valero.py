# -*- coding: utf-8 -*-
from __future__ import annotations

from typing import Any, Dict

try:
    from langgraph.graph import StateGraph  # type: ignore
except Exception:
    StateGraph = None  # type: ignore

# Placeholder nodes

def node_scan(state: Dict[str, Any]) -> Dict[str, Any]:
    state['scan'] = {'files': 0}
    return state

def node_map(state: Dict[str, Any]) -> Dict[str, Any]:
    state['architecture'] = {'nodes': 0}
    return state

def node_quality(state: Dict[str, Any]) -> Dict[str, Any]:
    state['quality'] = {'issues': []}
    return state

def node_refactor_plan(state: Dict[str, Any]) -> Dict[str, Any]:
    state['refactor'] = {'plan': []}
    return state

def node_report(state: Dict[str, Any]) -> Dict[str, Any]:
    state['report'] = "OK"
    return state


def build_workflow() -> Any:
    if StateGraph is None:
        return None
    g = StateGraph(dict)
    g.add_node('scan', node_scan)
    g.add_node('map', node_map)
    g.add_node('quality', node_quality)
    g.add_node('refactor', node_refactor_plan)
    g.add_node('report', node_report)

    g.add_edge('scan', 'map')
    g.add_edge('map', 'quality')
    g.add_edge('quality', 'refactor')
    g.add_edge('refactor', 'report')

    g.set_entry_point('scan')
    return g.compile()


def run_sequential() -> Dict[str, Any]:
    state: Dict[str, Any] = {}
    for fn in (node_scan, node_map, node_quality, node_refactor_plan, node_report):
        state = fn(state)
    return state
