# Dynamische Importe über den Handler
settings = import_from('core.config', 'settings')
if not settings:
    settings = import_from('app.core.config', 'settings')

get_db = import_from('db.database', 'get_db')
if not get_db:
    get_db = import_from('app.db.database', 'get_db')

engine = import_from('db.database', 'engine')
if not engine:
    engine = import_from('app.db.database', 'engine')

Base = import_from('db.base', 'Base')
if not Base:
    Base = import_from('app.db.base', 'Base')
    if not Base:
        # Fallback: Erstelle eine Base-Klasse, um Fehler zu vermeiden
        from sqlalchemy.ext.declarative import declarative_base
        Base = declarative_base()
        print("WARNUNG: Keine Base-Klasse gefunden, verwende Fallback Base") 