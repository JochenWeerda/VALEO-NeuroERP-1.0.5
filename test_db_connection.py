#!/usr/bin/env python3
"""
🧠 VALEO NeuroERP - Einfacher Datenbank-Test
===========================================
Testet Verbindung und erstellt eine einfache Test-Tabelle
"""

import psycopg2
import sys

def test_connection():
    """Testet die Datenbankverbindung"""
    try:
        print("🔌 Teste PostgreSQL-Verbindung...")
        
        conn = psycopg2.connect(
            host='localhost',
            database='postgres',  # Standard-DB
            user='valeo_user',
            password='valeo_password',
            port=5432
        )
        
        print("✅ PostgreSQL-Verbindung erfolgreich!")
        
        # Teste einfache Query
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"📊 PostgreSQL Version: {version[0]}")
        
        return conn
        
    except Exception as e:
        print(f"❌ Verbindungsfehler: {e}")
        return None

def create_test_table(conn):
    """Erstellt eine einfache Test-Tabelle"""
    try:
        print("\n📋 Erstelle Test-Tabelle...")
        
        cursor = conn.cursor()
        
        # Erstelle Test-Tabelle
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS test_neuroflow (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        cursor.execute(create_table_sql)
        conn.commit()
        
        print("✅ Test-Tabelle 'test_neuroflow' erstellt!")
        
        # Füge Test-Daten ein
        insert_sql = """
        INSERT INTO test_neuroflow (name) VALUES 
        ('NeuroFlow Test 1'),
        ('NeuroFlow Test 2')
        ON CONFLICT DO NOTHING;
        """
        
        cursor.execute(insert_sql)
        conn.commit()
        
        print("✅ Test-Daten eingefügt!")
        
        # Zeige Daten an
        cursor.execute("SELECT * FROM test_neuroflow;")
        rows = cursor.fetchall()
        
        print("\n📊 Test-Daten:")
        for row in rows:
            print(f"  ID: {row[0]}, Name: {row[1]}, Erstellt: {row[2]}")
        
        return True
        
    except Exception as e:
        print(f"❌ Fehler beim Erstellen der Test-Tabelle: {e}")
        return False

def test_schema_creation(conn):
    """Testet Schema-Erstellung"""
    try:
        print("\n🏗️ Teste Schema-Erstellung...")
        
        cursor = conn.cursor()
        
        # Erstelle Test-Schema
        create_schema_sql = """
        CREATE SCHEMA IF NOT EXISTS test_neuroflow;
        """
        
        cursor.execute(create_schema_sql)
        conn.commit()
        
        print("✅ Test-Schema 'test_neuroflow' erstellt!")
        
        # Erstelle Tabelle im Schema
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS test_neuroflow.test_table (
            id SERIAL PRIMARY KEY,
            test_field VARCHAR(200),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        cursor.execute(create_table_sql)
        conn.commit()
        
        print("✅ Test-Tabelle im Schema erstellt!")
        
        return True
        
    except Exception as e:
        print(f"❌ Fehler beim Schema-Test: {e}")
        return False

def main():
    """Hauptfunktion"""
    print("🧠 VALEO NeuroERP - Datenbank-Test")
    print("=" * 50)
    
    # Teste Verbindung
    conn = test_connection()
    if not conn:
        print("❌ Kann nicht fortfahren - keine Verbindung")
        sys.exit(1)
    
    try:
        # Teste Tabellenerstellung
        success1 = create_test_table(conn)
        
        # Teste Schema-Erstellung
        success2 = test_schema_creation(conn)
        
        if success1 and success2:
            print("\n🎉 Alle Tests erfolgreich!")
            print("✅ Datenbank ist bereit für NeuroFlow-Migration")
        else:
            print("\n⚠️ Einige Tests fehlgeschlagen")
            
    finally:
        conn.close()
        print("\n🔌 Verbindung geschlossen")

if __name__ == "__main__":
    main() 