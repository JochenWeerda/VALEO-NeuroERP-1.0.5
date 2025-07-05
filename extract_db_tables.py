import json
import sys
from collections import defaultdict

def extract_db_tables(json_path, output_path=None):
    """
    Extrahiert die Datenbanktabellen und ihre Struktur aus einer JSON-Datei
    und gibt eine strukturierte Übersicht zurück.
    """
    try:
        # JSON-Datei lesen
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Daten aus dem ersten Blatt (Sheet1) extrahieren
        sheet_data = data.get("Sheet1", [])
        
        if not sheet_data:
            print("Keine Daten in Sheet1 gefunden.")
            return False
        
        # Gruppiere die Daten nach Tabellennamen
        tables = defaultdict(list)
        for row in sheet_data:
            table_name = row.get("TABELLE")
            field_position = row.get("FIELDPOSITION")
            column_name = row.get("SPALTE")
            
            if table_name and column_name is not None:
                tables[table_name].append({
                    "position": field_position,
                    "name": column_name
                })
        
        # Sortiere die Spalten nach Position für jede Tabelle
        for table_name, columns in tables.items():
            tables[table_name] = sorted(columns, key=lambda x: x["position"] if x["position"] is not None else float('inf'))
        
        # Strukturiertes Ergebnis
        result = {
            "total_tables": len(tables),
            "tables": {
                table_name: {
                    "columns_count": len(columns),
                    "columns": [col["name"] for col in columns]
                }
                for table_name, columns in tables.items()
            }
        }
        
        # Ergebnis formatieren und ausgeben
        print(f"Gefundene Tabellen: {result['total_tables']}")
        
        # Sortiere Tabellen nach Namen für eine bessere Übersicht
        sorted_tables = sorted(result["tables"].items())
        
        # Detaillierte Ausgabe der Tabellen
        for table_name, table_info in sorted_tables:
            print(f"\n=== Tabelle: {table_name} ===")
            print(f"Anzahl Spalten: {table_info['columns_count']}")
            print("Spalten:")
            for i, column in enumerate(table_info["columns"]):
                print(f"  {i+1}. {column}")
        
        # Optional: Speichere das strukturierte Ergebnis in einer Datei
        if output_path:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            print(f"\nStrukturiertes Ergebnis wurde in {output_path} gespeichert.")
        
        return result
    
    except Exception as e:
        print(f"Fehler beim Extrahieren der Datenbanktabellen: {str(e)}")
        return False

if __name__ == "__main__":
    # Prüfe die Argumente
    if len(sys.argv) < 2:
        print("Verwendung: python extract_db_tables.py <json_pfad> [output_pfad]")
        sys.exit(1)
    
    json_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None
    
    # Extrahiere die Datenbanktabellen
    result = extract_db_tables(json_path, output_path)
    
    if not result:
        sys.exit(1) 