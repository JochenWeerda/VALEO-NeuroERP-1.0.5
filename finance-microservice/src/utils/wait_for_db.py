#!/usr/bin/env python
"""
Dieses Skript wartet, bis die Datenbankverbindung hergestellt werden kann.
Es versucht wiederholt, eine Verbindung herzustellen, und bricht erst ab, wenn
die Datenbank verfügbar ist oder die maximale Anzahl von Versuchen erreicht ist.
"""

import os
import sys
import time
from typing import Optional

import psycopg2
from tenacity import (
    retry,
    stop_after_attempt,
    wait_fixed,
    retry_if_exception_type,
    RetryError,
)


@retry(
    stop=stop_after_attempt(30),
    wait=wait_fixed(2),
    retry=retry_if_exception_type(
        (psycopg2.OperationalError, psycopg2.InterfaceError)
    ),
    reraise=True,
)
def wait_for_database(dsn: str) -> None:
    """Versucht wiederholt, eine Verbindung zur Datenbank herzustellen."""
    conn = psycopg2.connect(dsn)
    conn.close()
    print("Datenbankverbindung hergestellt!")


def get_dsn_from_env() -> Optional[str]:
    """Extrahiert den DSN aus der DATABASE_URL-Umgebungsvariable."""
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        return None
    return db_url


def main() -> None:
    """Hauptfunktion zum Warten auf die Datenbank."""
    print("Warte auf Datenbankverbindung...")
    dsn = get_dsn_from_env()
    
    if not dsn:
        print("ERROR: Keine DATABASE_URL-Umgebungsvariable gefunden.")
        sys.exit(1)
    
    try:
        wait_for_database(dsn)
    except RetryError:
        print("ERROR: Konnte keine Verbindung zur Datenbank herstellen nach mehreren Versuchen.")
        sys.exit(1)
    except Exception as e:
        print(f"ERROR: Unerwarteter Fehler beim Verbinden zur Datenbank: {e}")
        sys.exit(1)
    
    print("Datenbank ist bereit!")


if __name__ == "__main__":
    main() 