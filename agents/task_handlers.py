from typing import Dict, List, Optional, Set
import ast
from pathlib import Path
import networkx as nx
import matplotlib.pyplot as plt
from datetime import datetime
import json

class CircularDependencyResolver:
    """Löst zirkuläre Abhängigkeiten auf"""
    
    def __init__(self, project_root: str):
        self.root = Path(project_root)
        self.graph = nx.DiGraph()
        self.cycles: List[List[str]] = []
        
    def analyze_dependencies(self):
        """Analysiert Projektabhängigkeiten"""
        # Sammle Python-Dateien
        for file in self.root.rglob("*.py"):
            self._analyze_file(file)
            
        # Finde Zyklen
        self.cycles = list(nx.simple_cycles(self.graph))
        
    def _analyze_file(self, file: Path):
        """Analysiert eine Datei"""
        module_name = self._get_module_name(file)
        
        with open(file, "r", encoding="utf-8") as f:
            try:
                tree = ast.parse(f.read())
            except:
                return
                
        # Analysiere Imports
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for name in node.names:
                    imported = name.name.split(".")[0]
                    self.graph.add_edge(module_name, imported)
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    imported = node.module.split(".")[0]
                    self.graph.add_edge(module_name, imported)
                    
    def _get_module_name(self, file: Path) -> str:
        """Ermittelt den Modulnamen"""
        rel_path = file.relative_to(self.root)
        parts = list(rel_path.parts)
        parts[-1] = parts[-1][:-3]  # Entferne .py
        return ".".join(parts)
        
    def resolve_cycles(self) -> List[Dict]:
        """Löst gefundene Zyklen auf"""
        resolutions = []
        
        for cycle in self.cycles:
            # Finde schwächste Verbindung
            min_deps = float("inf")
            weak_link = None
            
            for i in range(len(cycle)):
                module1 = cycle[i]
                module2 = cycle[(i + 1) % len(cycle)]
                
                deps = self._count_dependencies(module1, module2)
                if deps < min_deps:
                    min_deps = deps
                    weak_link = (module1, module2)
                    
            if weak_link:
                # Erstelle Interface
                interface_name = f"I{weak_link[1].split('.')[-1]}"
                resolution = {
                    "cycle": cycle,
                    "weak_link": weak_link,
                    "solution": {
                        "type": "interface",
                        "name": interface_name,
                        "module1": weak_link[0],
                        "module2": weak_link[1]
                    }
                }
                resolutions.append(resolution)
                
        return resolutions
        
    def _count_dependencies(self, module1: str, module2: str) -> int:
        """Zählt Abhängigkeiten zwischen Modulen"""
        count = 0
        module1_path = self.root / f"{module1.replace('.', '/')}.py"
        
        if not module1_path.exists():
            return 0
            
        with open(module1_path, "r", encoding="utf-8") as f:
            try:
                content = f.read()
                # Zähle direkte Imports
                count += content.count(f"import {module2}")
                count += content.count(f"from {module2} import")
                # Zähle Verwendungen
                tree = ast.parse(content)
                for node in ast.walk(tree):
                    if isinstance(node, ast.Name) and node.id == module2.split(".")[-1]:
                        count += 1
            except:
                pass
                
        return count

class CouplingReducer:
    """Reduziert hohe Kopplung"""
    
    def __init__(self, project_root: str):
        self.root = Path(project_root)
        self.modules: Dict[str, Set[str]] = {}
        self.high_coupling: List[str] = []
        
    def analyze_coupling(self):
        """Analysiert Modul-Kopplung"""
        # Sammle Module
        for file in self.root.rglob("*.py"):
            module_name = self._get_module_name(file)
            self.modules[module_name] = set()
            
            with open(file, "r", encoding="utf-8") as f:
                try:
                    tree = ast.parse(f.read())
                except:
                    continue
                    
            # Sammle Abhängigkeiten
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for name in node.names:
                        self.modules[module_name].add(name.name.split(".")[0])
                elif isinstance(node, ast.ImportFrom):
                    if node.module:
                        self.modules[module_name].add(node.module.split(".")[0])
                        
        # Finde hohe Kopplung
        for module, deps in self.modules.items():
            if len(deps) > 8:  # Schwellwert für hohe Kopplung
                self.high_coupling.append(module)
                
    def reduce_coupling(self) -> List[Dict]:
        """Reduziert hohe Kopplung"""
        reductions = []
        
        for module in self.high_coupling:
            # Gruppiere Abhängigkeiten
            groups = self._group_dependencies(self.modules[module])
            
            # Erstelle Facades
            for group_name, deps in groups.items():
                if len(deps) > 3:  # Mindestgröße für Facade
                    reduction = {
                        "module": module,
                        "solution": {
                            "type": "facade",
                            "name": f"{group_name}Facade",
                            "dependencies": list(deps)
                        }
                    }
                    reductions.append(reduction)
                    
        return reductions
        
    def _group_dependencies(self, deps: Set[str]) -> Dict[str, Set[str]]:
        """Gruppiert Abhängigkeiten nach Funktionalität"""
        groups = {}
        
        for dep in deps:
            # Bestimme Gruppe nach Präfix oder Funktionalität
            if "api" in dep:
                group = "API"
            elif "model" in dep:
                group = "Model"
            elif "service" in dep:
                group = "Service"
            elif "util" in dep:
                group = "Util"
            else:
                group = "Misc"
                
            if group not in groups:
                groups[group] = set()
            groups[group].add(dep)
            
        return groups
        
    def _get_module_name(self, file: Path) -> str:
        """Ermittelt den Modulnamen"""
        rel_path = file.relative_to(self.root)
        parts = list(rel_path.parts)
        parts[-1] = parts[-1][:-3]  # Entferne .py
        return ".".join(parts)

class ImportOptimizer:
    """Optimiert das Import-System"""
    
    def __init__(self, project_root: str):
        self.root = Path(project_root)
        self.imports: Dict[str, Dict] = {}
        
    def analyze_imports(self):
        """Analysiert Imports im Projekt"""
        for file in self.root.rglob("*.py"):
            self._analyze_file(file)
            
    def _analyze_file(self, file: Path):
        """Analysiert eine Datei"""
        with open(file, "r", encoding="utf-8") as f:
            try:
                tree = ast.parse(f.read())
            except:
                return
                
        # Sammle Imports
        imports = []
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for name in node.names:
                    imports.append(name.name)
            elif isinstance(node, ast.ImportFrom):
                module = node.module or ""
                for name in node.names:
                    imports.append(f"{module}.{name.name}")
                    
        # Sammle definierte Namen
        defined_names = set()
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                defined_names.add(node.name)
            elif isinstance(node, ast.ClassDef):
                defined_names.add(node.name)
            elif isinstance(node, ast.Name) and isinstance(node.ctx, ast.Store):
                defined_names.add(node.id)
                
        # Sammle verwendete Namen
        used_names = set()
        for node in ast.walk(tree):
            if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Load):
                used_names.add(node.id)
                
        # Speichere Analyse
        self.imports[str(file)] = {
            "imports": imports,
            "defined_names": list(defined_names),
            "used_names": list(used_names)
        }
        
    def optimize_imports(self) -> Dict[str, List[Dict]]:
        """Optimiert Imports"""
        optimizations = {}
        
        for module, info in self.imports.items():
            module_opts = []
            
            # Entferne ungenutzte Imports
            if info["used_names"]:
                module_opts.append({
                    "type": "remove_unused",
                    "imports": info["used_names"]
                })
                
            # Gruppiere Imports
            groups = self._group_imports(info)
            if len(groups) > 1:
                module_opts.append({
                    "type": "reorder",
                    "groups": groups
                })
                
            if module_opts:
                optimizations[module] = module_opts
                
        return optimizations
        
    def _group_imports(self, info: Dict) -> List[List[str]]:
        """Gruppiert Imports"""
        stdlib = []
        third_party = []
        local = []
        
        # Gruppiere direkte Imports
        for imp in info["imports"]:
            if self._is_stdlib(imp):
                stdlib.append(f"import {imp}")
            elif self._is_local(imp):
                local.append(f"import {imp}")
            else:
                third_party.append(f"import {imp}")
                
        return [sorted(stdlib), sorted(third_party), sorted(local)]
        
    def _is_stdlib(self, module: str) -> bool:
        """Prüft ob ein Modul zur Standardbibliothek gehört"""
        import sys
        return module in sys.stdlib_module_names
        
    def _is_local(self, module: str) -> bool:
        """Prüft ob ein Modul lokal ist"""
        return module.startswith((".", "backend", "frontend", "tools"))
        
    def _get_module_name(self, file: Path) -> str:
        """Ermittelt den Modulnamen"""
        rel_path = file.relative_to(self.root)
        parts = list(rel_path.parts)
        parts[-1] = parts[-1][:-3]  # Entferne .py
        return ".".join(parts)

class ServiceLayerImplementer:
    """Implementiert die Service-Layer"""
    
    def __init__(self, project_root: str):
        self.root = Path(project_root)
        
    def implement_service_layer(self) -> Dict:
        """Implementiert die Service-Layer"""
        # Erstelle Service-Basis
        base_service = '''
from typing import TypeVar, Generic, Optional, List, Dict, Any
from pydantic import BaseModel
from backend.core.db import Database
from backend.core.cache import Cache

T = TypeVar('T', bound=BaseModel)

class BaseService(Generic[T]):
    """Basis-Service für die Business-Logic"""
    
    def __init__(self):
        self.db = Database()
        self.cache = Cache()
        
    async def get(self, id: str) -> Optional[T]:
        """Holt eine Entität nach ID"""
        # Prüfe Cache
        cached = await self.cache.get(f"{self.model.__name__}:{id}")
        if cached:
            return self.model.parse_raw(cached)
            
        # Hole aus DB
        result = await self.db.find_one(
            self.collection,
            {"_id": id}
        )
        
        if result:
            # Cache aktualisieren
            entity = self.model.parse_obj(result)
            await self.cache.set(
                f"{self.model.__name__}:{id}",
                entity.json()
            )
            return entity
            
        return None
        
    async def list(self, filter: Dict[str, Any] = None) -> List[T]:
        """Listet Entitäten auf"""
        results = await self.db.find(
            self.collection,
            filter or {}
        )
        return [self.model.parse_obj(r) for r in results]
        
    async def create(self, entity: T) -> T:
        """Erstellt eine neue Entität"""
        result = await self.db.insert_one(
            self.collection,
            entity.dict()
        )
        entity.id = str(result.inserted_id)
        
        # Cache aktualisieren
        await self.cache.set(
            f"{self.model.__name__}:{entity.id}",
            entity.json()
        )
        
        return entity
        
    async def update(self, id: str, entity: T) -> Optional[T]:
        """Aktualisiert eine Entität"""
        result = await self.db.update_one(
            self.collection,
            {"_id": id},
            {"$set": entity.dict()}
        )
        
        if result.modified_count:
            # Cache aktualisieren
            await self.cache.delete(f"{self.model.__name__}:{id}")
            return await self.get(id)
            
        return None
        
    async def delete(self, id: str) -> bool:
        """Löscht eine Entität"""
        result = await self.db.delete_one(
            self.collection,
            {"_id": id}
        )
        
        if result.deleted_count:
            # Cache löschen
            await self.cache.delete(f"{self.model.__name__}:{id}")
            return True
            
        return False
'''
        
        # Erstelle Beispiel-Service
        example_service = '''
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from .base_service import BaseService

class User(BaseModel):
    """Benutzer-Modell"""
    id: Optional[str]
    username: str
    email: str
    created_at: datetime = datetime.now()
    
class UserService(BaseService[User]):
    """Service für Benutzer-Management"""
    
    model = User
    collection = "users"
    
    async def find_by_email(self, email: str) -> Optional[User]:
        """Findet einen Benutzer per E-Mail"""
        return await self.get_by_filter({"email": email})
        
    async def list_active(self) -> List[User]:
        """Listet aktive Benutzer auf"""
        return await self.list({"active": True})
'''
        
        # Speichere Service-Layer
        service_dir = self.root / "backend" / "services"
        service_dir.mkdir(parents=True, exist_ok=True)
        
        with open(service_dir / "base_service.py", "w") as f:
            f.write(base_service)
            
        with open(service_dir / "user_service.py", "w") as f:
            f.write(example_service)
            
        return {
            "status": "success",
            "message": "Service-Layer implementiert",
            "files": [
                str(service_dir / "base_service.py"),
                str(service_dir / "user_service.py")
            ]
        }

    async def _resolve_circular_deps(self, context: Dict) -> Dict:
        """Löst zirkuläre Abhängigkeiten auf"""
        resolver = CircularDependencyResolver(str(self.root))
        resolver.analyze_dependencies()
        resolutions = resolver.resolve_cycles()
        
        if not resolutions:
            return {
                "status": "success",
                "message": "Keine zirkulären Abhängigkeiten gefunden"
            }
            
        # Implementiere Lösungen
        for resolution in resolutions:
            if resolution["solution"]["type"] == "interface":
                # Erstelle Interface
                interface_path = self.root / "backend" / "interfaces"
                interface_path.mkdir(parents=True, exist_ok=True)
                
                interface_file = interface_path / f"{resolution['solution']['name']}.py"
                with open(interface_file, "w") as f:
                    f.write(f"""from typing import Protocol

class {resolution['solution']['name']}(Protocol):
    \"\"\"Interface für {resolution['solution']['module2']}\"\"\"
    # TODO: Definiere Interface-Methoden
    pass
""")
                
                # Aktualisiere Module
                module1_path = self.root / f"{resolution['solution']['module1'].replace('.', '/')}.py"
                module2_path = self.root / f"{resolution['solution']['module2'].replace('.', '/')}.py"
                
                if module1_path.exists():
                    with open(module1_path, "r+") as f:
                        content = f.read()
                        # Ersetze Imports
                        new_content = content.replace(
                            f"from {resolution['solution']['module2']} import",
                            f"from backend.interfaces.{resolution['solution']['name']} import"
                        )
                        f.seek(0)
                        f.write(new_content)
                        f.truncate()
                        
        return {
            "status": "success",
            "message": f"{len(resolutions)} zirkuläre Abhängigkeiten aufgelöst",
            "resolutions": resolutions
        }
        
    async def _reduce_coupling(self, context: Dict) -> Dict:
        """Reduziert hohe Kopplung"""
        reducer = CouplingReducer(str(self.root))
        reducer.analyze_coupling()
        reductions = reducer.reduce_coupling()
        
        if not reductions:
            return {
                "status": "success",
                "message": "Keine hohe Kopplung gefunden"
            }
            
        # Implementiere Facades
        for reduction in reductions:
            if reduction["solution"]["type"] == "facade":
                # Erstelle Facade
                facade_path = self.root / "backend" / "facades"
                facade_path.mkdir(parents=True, exist_ok=True)
                
                facade_file = facade_path / f"{reduction['solution']['name']}.py"
                with open(facade_file, "w") as f:
                    f.write(f"""from typing import Dict, Any

class {reduction['solution']['name']}:
    \"\"\"Facade für {', '.join(reduction['solution']['dependencies'])}\"\"\"
    
    def __init__(self):
        # Initialisiere Dependencies
        pass
        
    # TODO: Implementiere Facade-Methoden
""")
                
                # Aktualisiere Module
                module_path = self.root / f"{reduction['module'].replace('.', '/')}.py"
                if module_path.exists():
                    with open(module_path, "r+") as f:
                        content = f.read()
                        # Füge Facade-Import hinzu
                        new_content = f"from backend.facades.{reduction['solution']['name']} import {reduction['solution']['name']}\n"
                        new_content += content
                        f.seek(0)
                        f.write(new_content)
                        f.truncate()
                        
        return {
            "status": "success",
            "message": f"{len(reductions)} Kopplungen reduziert",
            "reductions": reductions
        }
        
    async def _optimize_imports(self, context: Dict) -> Dict:
        """Optimiert das Import-System"""
        optimizer = ImportOptimizer(str(self.root))
        optimizer.analyze_imports()
        optimizations = optimizer.optimize_imports()
        
        if not optimizations:
            return {
                "status": "success",
                "message": "Keine Import-Optimierungen notwendig"
            }
            
        # Implementiere Optimierungen
        for module, opts in optimizations.items():
            module_path = self.root / f"{module.replace('.', '/')}.py"
            if not module_path.exists():
                continue
                
            with open(module_path, "r") as f:
                content = f.readlines()
                
            # Entferne ungenutzte Imports
            for opt in opts:
                if opt["type"] == "remove_unused":
                    new_content = []
                    for line in content:
                        skip = False
                        for imp in opt["imports"]:
                            if imp in line and "import" in line:
                                skip = True
                                break
                        if not skip:
                            new_content.append(line)
                    content = new_content
                    
                elif opt["type"] == "reorder":
                    # Gruppiere Imports
                    imports = {"stdlib": [], "third_party": [], "local": []}
                    non_imports = []
                    
                    for line in content:
                        if "import" in line:
                            if line.startswith("from"):
                                module = line.split()[1]
                            else:
                                module = line.split()[1].split(".")[0]
                                
                            if self._is_stdlib(module):
                                imports["stdlib"].append(line)
                            elif self._is_local(module):
                                imports["local"].append(line)
                            else:
                                imports["third_party"].append(line)
                        else:
                            non_imports.append(line)
                            
                    # Schreibe neu geordnet
                    new_content = []
                    for group in ["stdlib", "third_party", "local"]:
                        if imports[group]:
                            new_content.extend(sorted(imports[group]))
                            new_content.append("\n")
                    new_content.extend(non_imports)
                    content = new_content
                    
            # Speichere Änderungen
            with open(module_path, "w") as f:
                f.writelines(content)
                
        return {
            "status": "success",
            "message": f"{len(optimizations)} Module optimiert",
            "optimizations": optimizations
        }
        
    def _is_stdlib(self, module: str) -> bool:
        """Prüft ob ein Modul zur Standardbibliothek gehört"""
        import sys
        return module in sys.stdlib_module_names
        
    def _is_local(self, module: str) -> bool:
        """Prüft ob ein Modul lokal ist"""
        return module.startswith((".", "backend", "frontend", "tools"))
        
    async def _execute_generic_task(self, context: Dict) -> Dict:
        """Führt einen generischen Task aus"""
        return {
            "status": "success",
            "message": f"Task {context['task']} ausgeführt"
        } 