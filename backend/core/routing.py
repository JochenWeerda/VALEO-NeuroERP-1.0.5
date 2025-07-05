"""
Routing-Modul für die zentrale Routenregistrierung
"""

import logging
from starlette.routing import Route, Mount
from starlette.responses import JSONResponse

logger = logging.getLogger("core.routing")

class APIRouter:
    """
    Router-Klasse für die Verwaltung von API-Routen.
    
    Diese Klasse ermöglicht die einfache Registrierung von API-Endpunkten
    und die Gruppierung von Routen nach Funktionsbereichen.
    """
    
    def __init__(self, prefix="", tags=None):
        """
        Initialisiert einen neuen Router.
        
        Args:
            prefix: Präfix für alle Routen dieses Routers
            tags: Tags für die Dokumentation
        """
        self.prefix = prefix
        self.tags = tags if tags else []
        self.routes = []
        logger.debug(f"Router mit Präfix '{prefix}' erstellt")
    
    def add_route(self, path, endpoint, methods=None, name=None):
        """
        Fügt eine neue Route hinzu.
        
        Args:
            path: Pfad der Route
            endpoint: Funktion, die die Route bearbeitet
            methods: HTTP-Methoden (GET, POST, etc.)
            name: Name der Route
            
        Returns:
            Funktion: Die übergebene Endpunkt-Funktion (für Decorator-Unterstützung)
        """
        if methods is None:
            methods = ["GET"]
        
        # Vollständigen Pfad erstellen
        full_path = f"{self.prefix}{path}"
        
        logger.debug(f"Route {methods} {full_path} hinzugefügt")
        self.routes.append(Route(full_path, endpoint=endpoint, methods=methods, name=name))
        
        return endpoint
    
    def get(self, path, name=None):
        """
        Decorator für GET-Routen.
        
        Args:
            path: Pfad der Route
            name: Name der Route
            
        Returns:
            Decorator-Funktion
        """
        def decorator(endpoint):
            return self.add_route(path, endpoint, methods=["GET"], name=name)
        return decorator
    
    def post(self, path, name=None):
        """
        Decorator für POST-Routen.
        
        Args:
            path: Pfad der Route
            name: Name der Route
            
        Returns:
            Decorator-Funktion
        """
        def decorator(endpoint):
            return self.add_route(path, endpoint, methods=["POST"], name=name)
        return decorator
    
    def put(self, path, name=None):
        """
        Decorator für PUT-Routen.
        
        Args:
            path: Pfad der Route
            name: Name der Route
            
        Returns:
            Decorator-Funktion
        """
        def decorator(endpoint):
            return self.add_route(path, endpoint, methods=["PUT"], name=name)
        return decorator
    
    def delete(self, path, name=None):
        """
        Decorator für DELETE-Routen.
        
        Args:
            path: Pfad der Route
            name: Name der Route
            
        Returns:
            Decorator-Funktion
        """
        def decorator(endpoint):
            return self.add_route(path, endpoint, methods=["DELETE"], name=name)
        return decorator
    
    def include_router(self, router, prefix=""):
        """
        Fügt die Routen eines anderen Routers hinzu.
        
        Args:
            router: APIRouter-Instanz
            prefix: Zusätzliches Präfix für die Routen
            
        Returns:
            APIRouter: Selbstreferenz
        """
        combined_prefix = f"{self.prefix}{prefix}"
        
        for route in router.routes:
            # Neuen Pfad mit kombiniertem Präfix erstellen
            if isinstance(route, Route):
                new_path = route.path.replace(router.prefix, combined_prefix)
                self.add_route(
                    new_path, 
                    route.endpoint, 
                    methods=route.methods, 
                    name=route.name
                )
            elif isinstance(route, Mount):
                # Mounts werden direkt hinzugefügt
                self.routes.append(route)
        
        logger.debug(f"Router mit Präfix '{router.prefix}' in Router mit Präfix '{self.prefix}' eingebunden")
        
        return self
    
    def mount(self, path, app, name=None):
        """
        Fügt einen Mount-Punkt hinzu.
        
        Args:
            path: Pfad des Mount-Punkts
            app: App, die eingebunden werden soll
            name: Name des Mount-Punkts
            
        Returns:
            APIRouter: Selbstreferenz
        """
        full_path = f"{self.prefix}{path}"
        
        logger.debug(f"Mount {full_path} hinzugefügt")
        self.routes.append(Mount(full_path, app=app, name=name))
        
        return self
    
    def get_routes(self):
        """
        Gibt alle Routen dieses Routers zurück.
        
        Returns:
            list: Liste der Routen
        """
        return self.routes

# Globaler Standard-Router
main_router = APIRouter()

# Root-Handler
@main_router.get("/")
async def root(request):
    """
    Standard-Handler für die Root-Route.
    """
    return JSONResponse({
        "message": "Willkommen beim modularen ERP-System",
        "docs_url": "/docs",
        "openapi_url": "/openapi.json"
    }) 