"""
Modul-Optimierer für das ERP-System

Dieses Modul bietet Funktionen zur Optimierung der Projektstruktur für zukünftige Erweiterungen.
"""

import os
import sys
import shutil
import importlib
import inspect
from pathlib import Path
from typing import Dict, List, Set, Optional, Tuple, Any

# Versuche, das Pfadregister zu importieren
try:
    from backend.core.path_registry import get_registry
except ImportError:
    try:
        from core.path_registry import get_registry
    except ImportError:
        # Fallback ohne Pfadregister
        def get_registry():
            return None

# Versuche, den Modulanalyzer zu importieren
try:
    from backend.utils.module_analyzer import analyze_project
except ImportError:
    try:
        from utils.module_analyzer import analyze_project
    except ImportError:
        # Fallback ohne Modulanalyzer
        def analyze_project():
            return {}


class ModuleOptimizer:
    """Optimiert die Modulstruktur des Projekts für zukünftige Erweiterungen"""
    
    def __init__(self, root_dir: Optional[str] = None, dry_run: bool = False):
        """Initialisiere den Modul-Optimierer
        
        Args:
            root_dir: Wurzelverzeichnis des Projekts (optional)
            dry_run: Wenn True, werden keine Änderungen vorgenommen
        """
        self.registry = get_registry()
        self.dry_run = dry_run
        
        if root_dir:
            self.root_dir = Path(root_dir)
        elif self.registry:
            self.root_dir = self.registry.get_path('root')
        else:
            # Versuche, das Wurzelverzeichnis zu ermitteln
            current_file = Path(inspect.getfile(inspect.currentframe()))
            self.root_dir = current_file.parent.parent.parent
        
        self.backend_dir = self.root_dir / 'backend'
        
        # Analysiere das Projekt
        self.analysis = analyze_project(str(self.root_dir))
        
        # Verfolgung der Änderungen
        self.changes = []
    
    def ensure_core_structure(self) -> None:
        """Stellt sicher, dass die Kernstruktur des Projekts korrekt ist"""
        # Liste der Kerndirektories
        core_dirs = [
            'backend/core',
            'backend/api',
            'backend/db',
            'backend/models',
            'backend/utils',
            'backend/tests',
            'backend/app',
            'backend/app/core',
            'backend/app/api',
            'backend/app/db',
            'backend/app/models',
            'backend/app/api/v1',
            'backend/app/api/v1/endpoints'
        ]
        
        for dir_path in core_dirs:
            full_path = self.root_dir / dir_path
            if not full_path.exists():
                if self.dry_run:
                    self.changes.append(f"Würde Verzeichnis erstellen: {dir_path}")
                else:
                    full_path.mkdir(parents=True, exist_ok=True)
                    self.changes.append(f"Verzeichnis erstellt: {dir_path}")
        
        # Stelle sicher, dass jedes Verzeichnis eine __init__.py hat
        for dir_path in core_dirs:
            init_file = self.root_dir / dir_path / '__init__.py'
            if not init_file.exists():
                if self.dry_run:
                    self.changes.append(f"Würde __init__.py erstellen: {dir_path}/__init__.py")
                else:
                    with open(init_file, 'w', encoding='utf-8') as f:
                        f.write(f'"""\n{dir_path.split("/")[-1]}-Modul\n"""\n')
                    self.changes.append(f"__init__.py erstellt: {dir_path}/__init__.py")
    
    def optimize_for_features(self) -> None:
        """Optimiert die Struktur für feature-basierte Erweiterungen"""
        # Stelle sicher, dass die Features-Struktur existiert
        features_dir = self.backend_dir / 'features'
        if not features_dir.exists():
            if self.dry_run:
                self.changes.append(f"Würde Features-Verzeichnis erstellen: {features_dir}")
            else:
                features_dir.mkdir(parents=True, exist_ok=True)
                # Erstelle __init__.py
                with open(features_dir / '__init__.py', 'w', encoding='utf-8') as f:
                    f.write('"""\nFeatures-Modul\n\nDieses Modul enthält alle Feature-spezifischen Implementierungen.\n"""\n')
                self.changes.append(f"Features-Verzeichnis erstellt: {features_dir}")
        
        # Erstelle Beispiel-Feature-Struktur
        example_feature_dir = features_dir / 'example_feature'
        if not example_feature_dir.exists() and not self.dry_run:
            example_feature_dir.mkdir(parents=True, exist_ok=True)
            
            # Erstelle Feature-Struktur
            subdirs = ['api', 'models', 'services', 'tests']
            for subdir in subdirs:
                subdir_path = example_feature_dir / subdir
                subdir_path.mkdir(exist_ok=True)
                
                # Erstelle __init__.py
                with open(subdir_path / '__init__.py', 'w', encoding='utf-8') as f:
                    f.write(f'"""\n{subdir}-Modul für example_feature\n"""\n')
            
            # Erstelle Feature-__init__.py
            with open(example_feature_dir / '__init__.py', 'w', encoding='utf-8') as f:
                f.write('"""\nBeispiel-Feature\n\nDieses Modul demonstriert die empfohlene Struktur für Features.\n"""\n')
            
            # Erstelle ein Beispiel-Modul
            with open(example_feature_dir / 'models' / 'example_model.py', 'w', encoding='utf-8') as f:
                f.write('''"""
Beispiel-Modell

Dieses Modul demonstriert, wie man Modelle mit dem zentralen Pfadregister erstellt.
"""

from sqlalchemy import Column, Integer, String
from typing import Optional

# Verwende den Import-Handler für zuverlässige Imports
try:
    from backend.core.import_handler import import_from
    Base = import_from('db.base', 'Base')
    if not Base:
        Base = import_from('app.db.base', 'Base')
except ImportError:
    # Fallback für direkten Import
    try:
        from backend.db.base import Base
    except ImportError:
        from backend.app.db.base import Base


class ExampleModel(Base):
    """Beispiel-Modell für Feature-Demonstrationszwecke"""
    
    __tablename__ = "example_models"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    description = Column(String(500), nullable=True)
''')
            
            # Erstelle ein Beispiel-Service
            with open(example_feature_dir / 'services' / 'example_service.py', 'w', encoding='utf-8') as f:
                f.write('''"""
Beispiel-Service

Dieses Modul demonstriert, wie man Services mit dem zentralen Pfadregister erstellt.
"""

from typing import List, Optional
from sqlalchemy.orm import Session

# Verwende den Import-Handler für zuverlässige Imports
try:
    from backend.core.import_handler import import_from
    ExampleModel = import_from('features.example_feature.models.example_model', 'ExampleModel')
except ImportError:
    # Fallback für direkten Import
    from ..models.example_model import ExampleModel


class ExampleService:
    """Service für die Verwaltung von Example-Objekten"""
    
    @staticmethod
    def create_example(db: Session, name: str, description: Optional[str] = None) -> ExampleModel:
        """Erstellt ein neues Example-Objekt
        
        Args:
            db: Datenbankverbindung
            name: Name des Beispiels
            description: Optionale Beschreibung
            
        Returns:
            Erstelltes Example-Objekt
        """
        example = ExampleModel(name=name, description=description)
        db.add(example)
        db.commit()
        db.refresh(example)
        return example
    
    @staticmethod
    def get_examples(db: Session, skip: int = 0, limit: int = 100) -> List[ExampleModel]:
        """Gibt eine Liste von Example-Objekten zurück
        
        Args:
            db: Datenbankverbindung
            skip: Anzahl der zu überspringenden Objekte
            limit: Maximale Anzahl von Objekten
            
        Returns:
            Liste von Example-Objekten
        """
        return db.query(ExampleModel).offset(skip).limit(limit).all()
''')
            
            # Erstelle ein Beispiel-API
            with open(example_feature_dir / 'api' / 'endpoints.py', 'w', encoding='utf-8') as f:
                f.write('''"""
Beispiel-API-Endpunkte

Dieses Modul demonstriert, wie man API-Endpunkte mit dem zentralen Pfadregister erstellt.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

# Verwende den Import-Handler für zuverlässige Imports
try:
    from backend.core.import_handler import import_from, import_module
    
    # Importiere die Abhängigkeiten
    get_db = import_from('db.database', 'get_db')
    if not get_db:
        get_db = import_from('app.db.database', 'get_db')
    
    # Importiere den Service
    example_service_module = import_module('features.example_feature.services.example_service')
    ExampleService = example_service_module.ExampleService
    
    # Importiere das Modell
    example_model_module = import_module('features.example_feature.models.example_model')
    ExampleModel = example_model_module.ExampleModel
except ImportError:
    # Fallback für direkten Import
    from backend.db.database import get_db
    from ..services.example_service import ExampleService
    from ..models.example_model import ExampleModel


# Pydantic-Modelle für API-Anfragen und -Antworten
class ExampleCreate(BaseModel):
    name: str
    description: str = None


class ExampleResponse(BaseModel):
    id: int
    name: str
    description: str = None
    
    class Config:
        orm_mode = True


# Router erstellen
router = APIRouter()


@router.post("/examples/", response_model=ExampleResponse)
def create_example(example: ExampleCreate, db: Session = Depends(get_db)):
    """Erstellt ein neues Example-Objekt"""
    return ExampleService.create_example(db, example.name, example.description)


@router.get("/examples/", response_model=List[ExampleResponse])
def get_examples(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Gibt eine Liste von Example-Objekten zurück"""
    return ExampleService.get_examples(db, skip, limit)
''')

            # Integriere das Feature in die API
            self._integrate_example_feature()
            
            self.changes.append(f"Beispiel-Feature erstellt: {example_feature_dir}")
    
    def _integrate_example_feature(self) -> None:
        """Integriert das Beispiel-Feature in die API"""
        # Finde die API-Router-Datei
        api_router_file = self.backend_dir / 'app' / 'api' / 'v1' / 'api.py'
        
        if api_router_file.exists():
            # Überprüfe, ob das Feature bereits integriert ist
            with open(api_router_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if 'features.example_feature' not in content:
                # Füge das Feature zur API hinzu
                new_content = content
                
                # Finde den richtigen Ort zum Einfügen des Imports
                import_section_end = content.find('\n\n', content.find('import'))
                if import_section_end != -1:
                    # Füge den Import hinzu
                    import_line = '\n# Import des Beispiel-Features\ntry:\n    from backend.features.example_feature.api.endpoints import router as example_router\nexcept ImportError:\n    # Fallback\n    from features.example_feature.api.endpoints import router as example_router'
                    new_content = content[:import_section_end] + import_line + content[import_section_end:]
                
                # Finde den richtigen Ort zum Einfügen des Routers
                router_section = new_content.find('api_router.include_router')
                if router_section != -1:
                    # Finde das Ende der Router-Sektion
                    router_section_end = new_content.find('\n\n', router_section)
                    if router_section_end == -1:
                        router_section_end = len(new_content)
                    
                    # Füge den Router hinzu
                    router_line = '\n\n# Beispiel-Feature-Router einbinden\napi_router.include_router(example_router, prefix="/example", tags=["example"])'
                    new_content = new_content[:router_section_end] + router_line + new_content[router_section_end:]
                
                # Schreibe die neue Datei
                if not self.dry_run:
                    with open(api_router_file, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    
                    self.changes.append(f"Beispiel-Feature in API integriert: {api_router_file}")
                else:
                    self.changes.append(f"Würde Beispiel-Feature in API integrieren: {api_router_file}")
    
    def create_feature_template(self, feature_name: str) -> None:
        """Erstellt eine Template-Struktur für ein neues Feature
        
        Args:
            feature_name: Name des neuen Features
        """
        # Normalisiere den Feature-Namen
        feature_name = feature_name.lower().replace(' ', '_').replace('-', '_')
        
        # Stelle sicher, dass das Features-Verzeichnis existiert
        features_dir = self.backend_dir / 'features'
        if not features_dir.exists():
            if self.dry_run:
                self.changes.append(f"Würde Features-Verzeichnis erstellen: {features_dir}")
            else:
                features_dir.mkdir(parents=True, exist_ok=True)
                # Erstelle __init__.py
                with open(features_dir / '__init__.py', 'w', encoding='utf-8') as f:
                    f.write('"""\nFeatures-Modul\n\nDieses Modul enthält alle Feature-spezifischen Implementierungen.\n"""\n')
                self.changes.append(f"Features-Verzeichnis erstellt: {features_dir}")
        
        # Erstelle Feature-Verzeichnis
        feature_dir = features_dir / feature_name
        if feature_dir.exists():
            self.changes.append(f"Feature {feature_name} existiert bereits: {feature_dir}")
            return
        
        if self.dry_run:
            self.changes.append(f"Würde Feature {feature_name} erstellen: {feature_dir}")
            return
        
        # Erstelle Feature-Struktur
        feature_dir.mkdir(parents=True, exist_ok=True)
        
        # Erstelle Feature-Unterverzeichnisse
        subdirs = ['api', 'models', 'services', 'tests']
        for subdir in subdirs:
            subdir_path = feature_dir / subdir
            subdir_path.mkdir(exist_ok=True)
            
            # Erstelle __init__.py
            with open(subdir_path / '__init__.py', 'w', encoding='utf-8') as f:
                f.write(f'"""\n{subdir}-Modul für {feature_name}\n"""\n')
        
        # Erstelle Feature-__init__.py
        with open(feature_dir / '__init__.py', 'w', encoding='utf-8') as f:
            f.write(f'"""\n{feature_name.replace("_", " ").title()}-Feature\n"""\n')
        
        self.changes.append(f"Feature {feature_name} erstellt: {feature_dir}")
    
    def optimize(self) -> List[str]:
        """Führt die Optimierung der Projektstruktur durch
        
        Returns:
            Liste der durchgeführten Änderungen
        """
        # Stelle sicher, dass die Kernstruktur korrekt ist
        self.ensure_core_structure()
        
        # Optimiere für feature-basierte Erweiterungen
        self.optimize_for_features()
        
        return self.changes


def optimize_project(root_dir: Optional[str] = None, dry_run: bool = False) -> List[str]:
    """Optimiert die Projektstruktur für zukünftige Erweiterungen
    
    Args:
        root_dir: Wurzelverzeichnis des Projekts (optional)
        dry_run: Wenn True, werden keine Änderungen vorgenommen
        
    Returns:
        Liste der durchgeführten Änderungen
    """
    optimizer = ModuleOptimizer(root_dir, dry_run)
    return optimizer.optimize()


def create_feature(feature_name: str, root_dir: Optional[str] = None, dry_run: bool = False) -> List[str]:
    """Erstellt eine neue Feature-Struktur
    
    Args:
        feature_name: Name des neuen Features
        root_dir: Wurzelverzeichnis des Projekts (optional)
        dry_run: Wenn True, werden keine Änderungen vorgenommen
        
    Returns:
        Liste der durchgeführten Änderungen
    """
    optimizer = ModuleOptimizer(root_dir, dry_run)
    optimizer.create_feature_template(feature_name)
    return optimizer.changes


if __name__ == "__main__":
    # Wenn direkt ausgeführt, optimiere das aktuelle Projekt
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Optimiert die Projektstruktur für zukünftige Erweiterungen."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simuliert die Optimierung ohne Änderungen vorzunehmen"
    )
    parser.add_argument(
        "--feature",
        help="Erstellt eine neue Feature-Struktur mit dem angegebenen Namen"
    )
    args = parser.parse_args()
    
    if args.feature:
        changes = create_feature(args.feature, dry_run=args.dry_run)
        print(f"Feature {args.feature} {'würde erstellt werden' if args.dry_run else 'erstellt'}:")
    else:
        changes = optimize_project(dry_run=args.dry_run)
        print(f"Projektstruktur {'würde optimiert werden' if args.dry_run else 'optimiert'}:")
    
    for change in changes:
        print(f"  - {change}") 