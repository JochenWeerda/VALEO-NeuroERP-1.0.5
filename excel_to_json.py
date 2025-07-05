import pandas as pd
import json
import sys
import os

def excel_to_json(excel_path, json_path=None):
    """
    Konvertiert eine Excel-Datei in JSON und gibt sie als String zurück.
    Speichert optional das JSON in einer Datei.
    """
    # Prüfen, ob die Datei existiert
    if not os.path.exists(excel_path):
        print(f"Fehler: Die Datei {excel_path} existiert nicht.")
        return None
    
    try:
        # Excel-Datei lesen - versuche, alle Blätter zu lesen
        xls = pd.ExcelFile(excel_path)
        sheet_names = xls.sheet_names
        
        # Dictionary für alle Blätter erstellen
        result = {}
        
        for sheet_name in sheet_names:
            try:
                # Lese das aktuelle Blatt
                df = pd.read_excel(excel_path, sheet_name=sheet_name)
                
                # Konvertiere das DataFrame in eine Liste von Dictionaries
                sheet_data = df.to_dict(orient='records')
                
                # Füge die Daten zum Ergebnis hinzu
                result[sheet_name] = sheet_data
            except Exception as e:
                print(f"Fehler beim Lesen des Blatts {sheet_name}: {str(e)}")
                result[sheet_name] = {"error": str(e)}
        
        # Konvertiere das Ergebnis in JSON
        json_str = json.dumps(result, ensure_ascii=False, indent=2)
        
        # Optional: Speichere das JSON in einer Datei
        if json_path:
            with open(json_path, 'w', encoding='utf-8') as f:
                f.write(json_str)
            print(f"JSON wurde in {json_path} gespeichert.")
        
        return json_str
    
    except Exception as e:
        print(f"Fehler beim Konvertieren der Excel-Datei: {str(e)}")
        return None

if __name__ == "__main__":
    # Prüfe die Argumente
    if len(sys.argv) < 2:
        print("Verwendung: python excel_to_json.py <excel_pfad> [json_pfad]")
        sys.exit(1)
    
    excel_path = sys.argv[1]
    json_path = sys.argv[2] if len(sys.argv) > 2 else None
    
    # Konvertiere die Excel-Datei
    json_str = excel_to_json(excel_path, json_path)
    
    # Gib das JSON aus, wenn keine Datei angegeben wurde
    if json_str and not json_path:
        print(json_str) 