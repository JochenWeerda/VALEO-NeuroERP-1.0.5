#!/usr/bin/env python3
"""
Einfacher PostgreSQL-Test
"""

import psycopg2
import traceback

print("🧠 Starte PostgreSQL-Test...")

try:
    print("1. Versuche Verbindung...")
    
    conn = psycopg2.connect(
        host='localhost',
        database='postgres',
        user='valeo_user',
        password='valeo_password',
        port=5432
    )
    
    print("✅ Verbindung erfolgreich!")
    
    cursor = conn.cursor()
    
    print("2. Teste einfache Query...")
    cursor.execute("SELECT 1 as test;")
    result = cursor.fetchone()
    print(f"✅ Query erfolgreich: {result}")
    
    print("3. Erstelle Test-Tabelle...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS simple_test (
            id SERIAL PRIMARY KEY,
            name TEXT
        );
    """)
    conn.commit()
    print("✅ Test-Tabelle erstellt!")
    
    print("4. Füge Test-Daten ein...")
    cursor.execute("INSERT INTO simple_test (name) VALUES ('NeuroFlow Test');")
    conn.commit()
    print("✅ Test-Daten eingefügt!")
    
    print("5. Lese Daten...")
    cursor.execute("SELECT * FROM simple_test;")
    rows = cursor.fetchall()
    for row in rows:
        print(f"   ID: {row[0]}, Name: {row[1]}")
    
    print("🎉 Alle Tests erfolgreich!")
    
    conn.close()
    
except Exception as e:
    print(f"❌ Fehler: {e}")
    print("Stack Trace:")
    traceback.print_exc() 