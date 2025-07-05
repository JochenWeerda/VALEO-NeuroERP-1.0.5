import json
import sys

def analyze_db_structure(json_path):
    """
    Analysiert die Struktur einer JSON-Datei mit Datenbankschema und gibt einen Überblick zurück.
    """
    try:
        # JSON-Datei lesen
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"Die JSON-Datei enthält {len(data)} Blätter/Tabellen:")
        
        # Über alle Blätter iterieren
        for sheet_name, sheet_data in data.items():
            print(f"\n=== Tabelle/Blatt: {sheet_name} ===")
            
            # Überprüfen, ob sheet_data eine Liste ist (normaler Fall) oder ein Fehlerobjekt
            if isinstance(sheet_data, list):
                if len(sheet_data) > 0:
                    # Anzahl der Einträge anzeigen
                    print(f"Enthält {len(sheet_data)} Einträge/Zeilen")
                    
                    # Spalten aus dem ersten Eintrag extrahieren
                    columns = list(sheet_data[0].keys())
                    print(f"Spalten ({len(columns)}): {', '.join(columns)}")
                    
                    # Beispielzeile anzeigen (erste Zeile)
                    print("\nBeispieldaten (erste Zeile):")
                    for key, value in sheet_data[0].items():
                        print(f"  {key}: {value}")
                else:
                    print("Enthält keine Einträge/Zeilen")
            else:
                print(f"Fehler beim Lesen des Blatts: {sheet_data.get('error', 'Unbekannter Fehler')}")
        
        return True
    
    except Exception as e:
        print(f"Fehler beim Analysieren der JSON-Datei: {str(e)}")
        return False

if __name__ == "__main__":
    # Prüfe die Argumente
    if len(sys.argv) < 2:
        print("Verwendung: python analyze_db_structure.py <json_pfad>")
        sys.exit(1)
    
    json_path = sys.argv[1]
    
    # Analysiere die JSON-Datei
    success = analyze_db_structure(json_path)
    
    if not success:
        sys.exit(1) 