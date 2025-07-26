import psycopg2
import sys

print("Starte Test...")

try:
    print("Verbinde...")
    conn = psycopg2.connect(
        host='localhost',
        database='postgres',
        user='valeo_user',  # Korrigierter Benutzername
        password='valeo_password',
        port=5432
    )
    print("Verbindung OK")
    
    cursor = conn.cursor()
    cursor.execute("CREATE TABLE IF NOT EXISTS python_test (id SERIAL, name TEXT)")
    conn.commit()
    print("Tabelle erstellt")
    
    cursor.execute("INSERT INTO python_test (name) VALUES ('Python Test')")
    conn.commit()
    print("Daten eingefügt")
    
    cursor.execute("SELECT * FROM python_test")
    rows = cursor.fetchall()
    print(f"Gefunden: {len(rows)} Zeilen")
    
    conn.close()
    print("Test erfolgreich")
    
except Exception as e:
    print(f"Fehler: {e}")
    print(f"Fehlertyp: {type(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1) 