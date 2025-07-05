import ast
from pathlib import Path
from typing import Dict, List, Optional
import jinja2
import networkx as nx
import matplotlib.pyplot as plt
from .config import CONFIG, DOC_TYPES, MARKDOWN, HTML, GRAPH

class DocumentationGenerator:
    """Generiert Dokumentation aus Code"""
    
    def __init__(self):
        self.config = CONFIG
        self.doc_types = DOC_TYPES
        self.markdown = MARKDOWN
        self.html = HTML
        self.graph = GRAPH
        
        # Initialisiere Jinja2
        self.jinja = jinja2.Environment(
            loader=jinja2.FileSystemLoader(str(self.config["template_dir"])),
            autoescape=True
        )
        
        # Erstelle Ausgabeverzeichnis
        self.config["output_dir"].mkdir(parents=True, exist_ok=True)
        
        # Initialisiere Graph
        self.dependency_graph = nx.DiGraph()
        
    def generate(self):
        """Generiert die komplette Dokumentation"""
        # Analysiere Module
        modules = self._collect_modules()
        
        # Generiere Dokumentation
        for module in modules:
            self._generate_module_doc(module)
            
        # Generiere Abhängigkeitsgraph
        self._generate_dependency_graph()
        
        # Generiere Index
        self._generate_index()
        
    def _collect_modules(self) -> List[Path]:
        """Sammelt zu dokumentierende Module"""
        modules = []
        for module in self.config["modules"]:
            path = Path(module)
            if path.is_dir():
                for file in path.rglob("*.py"):
                    # Prüfe Ignore-Patterns
                    ignore = False
                    for pattern in self.config["ignore"]:
                        if file.match(pattern):
                            ignore = True
                            break
                    if not ignore:
                        modules.append(file)
        return modules
        
    def _generate_module_doc(self, module: Path):
        """Generiert Dokumentation für ein Modul"""
        # Parse Python-Datei
        with open(module, "r", encoding="utf-8") as f:
            tree = ast.parse(f.read())
            
        # Sammle Informationen
        info = {
            "name": module.stem,
            "path": str(module),
            "description": ast.get_docstring(tree),
            "classes": self._collect_classes(tree),
            "functions": self._collect_functions(tree),
            "variables": self._collect_variables(tree),
            "dependencies": self._collect_dependencies(tree)
        }
        
        # Aktualisiere Abhängigkeitsgraph
        self._update_dependency_graph(info)
        
        # Generiere Markdown
        if "markdown" in self.config["formats"]:
            self._generate_markdown(info)
            
        # Generiere HTML
        if "html" in self.config["formats"]:
            self._generate_html(info)
            
    def _collect_classes(self, tree: ast.AST) -> List[Dict]:
        """Sammelt Klassen-Informationen"""
        classes = []
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                classes.append({
                    "name": node.name,
                    "description": ast.get_docstring(node),
                    "methods": self._collect_methods(node),
                    "attributes": self._collect_attributes(node),
                    "bases": [base.id for base in node.bases 
                             if isinstance(base, ast.Name)]
                })
        return classes
        
    def _collect_methods(self, node: ast.ClassDef) -> List[Dict]:
        """Sammelt Methoden-Informationen"""
        methods = []
        for child in node.body:
            if isinstance(child, ast.FunctionDef):
                methods.append({
                    "name": child.name,
                    "description": ast.get_docstring(child),
                    "parameters": self._collect_parameters(child),
                    "returns": self._collect_returns(child),
                    "decorators": [d.id for d in child.decorator_list 
                                 if isinstance(d, ast.Name)]
                })
        return methods
        
    def _collect_functions(self, tree: ast.AST) -> List[Dict]:
        """Sammelt Funktions-Informationen"""
        functions = []
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef) and \
               node.parent_field != "body":  # Keine Methoden
                functions.append({
                    "name": node.name,
                    "description": ast.get_docstring(node),
                    "parameters": self._collect_parameters(node),
                    "returns": self._collect_returns(node),
                    "decorators": [d.id for d in node.decorator_list 
                                 if isinstance(d, ast.Name)]
                })
        return functions
        
    def _collect_parameters(self, node: ast.FunctionDef) -> List[Dict]:
        """Sammelt Parameter-Informationen"""
        parameters = []
        for arg in node.args.args:
            parameters.append({
                "name": arg.arg,
                "annotation": self._get_annotation(arg.annotation)
            })
        return parameters
        
    def _collect_returns(self, node: ast.FunctionDef) -> Optional[str]:
        """Sammelt Return-Informationen"""
        return self._get_annotation(node.returns)
        
    def _get_annotation(self, node: Optional[ast.AST]) -> Optional[str]:
        """Extrahiert Typ-Annotation"""
        if node is None:
            return None
        if isinstance(node, ast.Name):
            return node.id
        if isinstance(node, ast.Constant):
            return str(node.value)
        if isinstance(node, ast.Subscript):
            return f"{self._get_annotation(node.value)}[{self._get_annotation(node.slice)}]"
        return None
        
    def _collect_variables(self, tree: ast.AST) -> List[Dict]:
        """Sammelt Variablen-Informationen"""
        variables = []
        for node in ast.walk(tree):
            if isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name):
                        variables.append({
                            "name": target.id,
                            "value": self._get_value(node.value)
                        })
        return variables
        
    def _get_value(self, node: ast.AST) -> str:
        """Extrahiert Wert"""
        if isinstance(node, ast.Constant):
            return str(node.value)
        if isinstance(node, ast.List):
            return f"[{', '.join(self._get_value(elt) for elt in node.elts)}]"
        if isinstance(node, ast.Dict):
            items = []
            for k, v in zip(node.keys, node.values):
                items.append(f"{self._get_value(k)}: {self._get_value(v)}")
            return f"{{{', '.join(items)}}}"
        return "<expression>"
        
    def _collect_dependencies(self, tree: ast.AST) -> List[str]:
        """Sammelt Abhängigkeiten"""
        dependencies = []
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for name in node.names:
                    dependencies.append(name.name)
            elif isinstance(node, ast.ImportFrom):
                module = node.module or ""
                for name in node.names:
                    dependencies.append(f"{module}.{name.name}")
        return dependencies
        
    def _update_dependency_graph(self, info: Dict):
        """Aktualisiert den Abhängigkeitsgraphen"""
        module_name = info["name"]
        self.dependency_graph.add_node(
            module_name,
            **self.graph["node_styles"]["module"]
        )
        
        # Füge Abhängigkeiten hinzu
        for dep in info["dependencies"]:
            self.dependency_graph.add_edge(
                module_name,
                dep.split(".")[0],
                **self.graph["edge_styles"]["imports"]
            )
            
        # Füge Klassen hinzu
        for cls in info["classes"]:
            class_name = f"{module_name}.{cls['name']}"
            self.dependency_graph.add_node(
                class_name,
                **self.graph["node_styles"]["class"]
            )
            self.dependency_graph.add_edge(
                module_name,
                class_name,
                **self.graph["edge_styles"]["contains"]
            )
            
            # Füge Vererbung hinzu
            for base in cls["bases"]:
                self.dependency_graph.add_edge(
                    class_name,
                    base,
                    **self.graph["edge_styles"]["inherits"]
                )
                
    def _generate_markdown(self, info: Dict):
        """Generiert Markdown-Dokumentation"""
        template = self.jinja.get_template(
            self.doc_types["module"]["template"]
        )
        content = template.render(
            info=info,
            config=self.config,
            markdown=self.markdown
        )
        
        output_file = self.config["output_dir"] / f"{info['name']}.md"
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(content)
            
    def _generate_html(self, info: Dict):
        """Generiert HTML-Dokumentation"""
        template = self.jinja.get_template(
            self.doc_types["module"]["template"].replace(".md.j2", ".html.j2")
        )
        content = template.render(
            info=info,
            config=self.config,
            html=self.html
        )
        
        output_file = self.config["output_dir"] / f"{info['name']}.html"
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(content)
            
    def _generate_dependency_graph(self):
        """Generiert Abhängigkeitsgraph"""
        plt.figure(figsize=(20, 20))
        pos = nx.spring_layout(self.dependency_graph, k=2, iterations=50)
        
        # Zeichne Knoten
        for node_type, style in self.graph["node_styles"].items():
            nodes = [n for n, d in self.dependency_graph.nodes(data=True)
                    if d.get("style") == style["style"]]
            nx.draw_networkx_nodes(
                self.dependency_graph,
                pos,
                nodelist=nodes,
                **style
            )
            
        # Zeichne Kanten
        for edge_type, style in self.graph["edge_styles"].items():
            edges = [e for e in self.dependency_graph.edges(data=True)
                    if e[2].get("style") == style["style"]]
            nx.draw_networkx_edges(
                self.dependency_graph,
                pos,
                edgelist=edges,
                **style
            )
            
        # Beschriftungen
        nx.draw_networkx_labels(
            self.dependency_graph,
            pos,
            font_size=8
        )
        
        # Speichere Graph
        plt.savefig(
            self.config["output_dir"] / "dependency_graph.png",
            format=self.config["graphviz"]["format"],
            dpi=self.config["graphviz"]["dpi"],
            bbox_inches="tight"
        )
        plt.close()
        
    def _generate_index(self):
        """Generiert Index-Seite"""
        modules = []
        for file in self.config["output_dir"].glob("*.md"):
            if file.stem != "index":
                modules.append({
                    "name": file.stem,
                    "path": str(file.relative_to(self.config["output_dir"]))
                })
                
        # Generiere Markdown
        if "markdown" in self.config["formats"]:
            template = self.jinja.get_template("index.md.j2")
            content = template.render(
                modules=modules,
                config=self.config,
                markdown=self.markdown
            )
            
            output_file = self.config["output_dir"] / "index.md"
            with open(output_file, "w", encoding="utf-8") as f:
                f.write(content)
                
        # Generiere HTML
        if "html" in self.config["formats"]:
            template = self.jinja.get_template("index.html.j2")
            content = template.render(
                modules=modules,
                config=self.config,
                html=self.html
            )
            
            output_file = self.config["output_dir"] / "index.html"
            with open(output_file, "w", encoding="utf-8") as f:
                f.write(content) 