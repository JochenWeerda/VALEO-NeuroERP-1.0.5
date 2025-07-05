import networkx as nx
import matplotlib.pyplot as plt
from pathlib import Path
import json

def create_dependency_graph(root: str, output_file: str = "dependency_graph.png"):
    """Erstellt einen Dependency-Graphen"""
    # Erstelle Graph
    G = nx.DiGraph()
    
    # Sammle Python-Dateien
    files = list(Path(root).rglob("*.py"))
    
    # Analysiere Abhängigkeiten
    for file in files:
        module = str(file.relative_to(root)).replace("\\", ".").replace(".py", "")
        G.add_node(module)
        
        with open(file, "r", encoding="utf-8") as f:
            try:
                content = f.read()
            except:
                continue
                
        # Finde Imports
        for line in content.split("\n"):
            if line.startswith("from "):
                parts = line.split(" import ")
                if len(parts) == 2:
                    from_module = parts[0].replace("from ", "").strip()
                    if from_module.startswith("."):
                        # Relativer Import
                        parent = str(file.parent.relative_to(root)).replace("\\", ".")
                        if from_module == ".":
                            from_module = parent
                        else:
                            from_module = f"{parent}{from_module}"
                    G.add_edge(module, from_module)
                    
            elif line.startswith("import "):
                imports = line.replace("import ", "").split(",")
                for imp in imports:
                    imp = imp.strip()
                    if " as " in imp:
                        imp = imp.split(" as ")[0]
                    G.add_edge(module, imp)
                    
    # Zeichne Graph
    plt.figure(figsize=(20, 20))
    pos = nx.spring_layout(G, k=2, iterations=50)
    nx.draw(G, pos, with_labels=True, node_color="lightblue", 
            node_size=2000, font_size=8, font_weight="bold",
            arrows=True, edge_color="gray", arrowsize=20)
            
    # Speichere Graph
    plt.savefig(output_file, format="png", dpi=300, bbox_inches="tight")
    plt.close()
    
    # Finde Zyklen
    cycles = list(nx.simple_cycles(G))
    
    # Speichere Metriken
    metrics = {
        "nodes": len(G.nodes),
        "edges": len(G.edges),
        "cycles": len(cycles),
        "avg_dependencies": sum(d for n, d in G.out_degree()) / len(G.nodes),
        "max_dependencies": max(d for n, d in G.out_degree()),
        "isolated_modules": len(list(nx.isolates(G)))
    }
    
    with open("dependency_metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)
        
    return G, metrics 