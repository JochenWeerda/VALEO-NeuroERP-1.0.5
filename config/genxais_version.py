#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
GENXAIS Versionskonfiguration
Diese Datei enthält die zentrale Versionsverwaltung für den GENXAIS-Zyklus.
"""

import os
import json
from pathlib import Path

# Pfad zur Versionsdatei
VERSION_FILE = Path("config/genxais_version.json")

def get_version():
    """
    Gibt die aktuelle GENXAIS-Version zurück.
    
    Returns:
        str: Die aktuelle Version im Format "v1.x"
    """
    if VERSION_FILE.exists():
        try:
            with open(VERSION_FILE, 'r') as f:
                version_data = json.load(f)
                return version_data.get("current_version", "v1.5")
        except Exception as e:
            print(f"Fehler beim Lesen der Versionsdatei: {e}")
            return "v1.5"  # Fallback-Version
    else:
        # Erstelle Standardversionsdatei, wenn sie nicht existiert
        set_version("v1.5")
        return "v1.5"

def get_previous_version():
    """
    Gibt die vorherige GENXAIS-Version zurück.
    
    Returns:
        str: Die vorherige Version im Format "v1.x"
    """
    current = get_version()
    try:
        # Extrahiere die Versionsnummer
        version_parts = current.split('.')
        major = version_parts[0]
        minor = int(version_parts[1])
        
        # Berechne die vorherige Version
        if minor > 1:
            return f"{major}.{minor-1}"
        else:
            return current  # Bei v1.1 gibt es keine vorherige Version
    except Exception:
        return "v1.4"  # Fallback

def set_version(version):
    """
    Setzt die aktuelle GENXAIS-Version.
    
    Args:
        version (str): Die zu setzende Version im Format "v1.x"
    """
    # Stelle sicher, dass das Verzeichnis existiert
    VERSION_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    # Speichere die Version
    with open(VERSION_FILE, 'w') as f:
        json.dump({
            "current_version": version,
            "previous_version": get_previous_version() if VERSION_FILE.exists() else "v1.4"
        }, f, indent=2)

def increment_version():
    """
    Erhöht die GENXAIS-Version um 0.1.
    
    Returns:
        str: Die neue Version im Format "v1.x"
    """
    current = get_version()
    try:
        # Extrahiere die Versionsnummer
        version_parts = current.split('.')
        major = version_parts[0]
        minor = int(version_parts[1])
        
        # Erhöhe die Minor-Version
        new_version = f"{major}.{minor+1}"
        
        # Speichere die neue Version
        set_version(new_version)
        
        return new_version
    except Exception as e:
        print(f"Fehler beim Inkrementieren der Version: {e}")
        return current

# Initialisiere die Versionsdatei, falls sie nicht existiert
if not VERSION_FILE.exists():
    set_version("v1.5")

# Exportiere die aktuelle Version als Konstante
CURRENT_VERSION = get_version()
PREVIOUS_VERSION = get_previous_version() 