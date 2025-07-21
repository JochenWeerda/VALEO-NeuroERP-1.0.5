#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
VALEO NeuroERP Datenbank-Matrix-Analyse
Vergleicht die aktuelle Datenbankstruktur mit der L3-ODS-Datei
"""

import pandas as pd
import json
from typing import Dict, List, Set, Tuple
import re

def load_l3_schema(csv_path: str) -> Dict[str, Set[str]]:
    """Lädt das L3-Schema aus der CSV-Datei"""
    print("Lade L3-Schema aus CSV-Datei...")
    df = pd.read_csv(csv_path)
    
    # Gruppiere nach Tabellennamen
    l3_schema = {}
    for _, row in df.iterrows():
        table_name = row['TABLE_NAME']
        column_name = row['COLUMN_NAME']
        
        if table_name not in l3_schema:
            l3_schema[table_name] = set()
        l3_schema[table_name].add(column_name)
    
    print(f"Geladen: {len(l3_schema)} Tabellen mit insgesamt {len(df)} Spalten")
    return l3_schema

def get_current_schema() -> Dict[str, Set[str]]:
    """Definiert die aktuelle Datenbankstruktur"""
    current_schema = {
        # Basis-Tabellen
        'users': {
            'id', 'username', 'email', 'password_hash', 'first_name', 'last_name', 
            'role', 'is_active', 'is_verified', 'last_login', 'created_at', 'updated_at'
        },
        'transactions': {
            'id', 'user_id', 'type', 'amount', 'currency', 'description', 'category', 
            'status', 'transaction_date', 'created_at', 'updated_at'
        },
        'inventory': {
            'id', 'name', 'sku', 'description', 'quantity', 'unit_price', 'category', 
            'supplier', 'status', 'min_quantity', 'max_quantity', 'location', 
            'created_at', 'updated_at'
        },
        'documents': {
            'id', 'user_id', 'title', 'filename', 'file_path', 'file_size', 'mime_type', 
            'category', 'tags', 'is_public', 'created_at', 'updated_at'
        },
        'reports': {
            'id', 'user_id', 'title', 'description', 'report_type', 'parameters', 
            'status', 'file_path', 'created_at', 'updated_at'
        },
        'notifications': {
            'id', 'user_id', 'title', 'message', 'type', 'is_read', 'created_at'
        },
        'system_logs': {
            'id', 'level', 'message', 'module', 'user_id', 'ip_address', 'user_agent', 'created_at'
        },
        'audit_logs': {
            'id', 'table_name', 'record_id', 'action', 'old_values', 'new_values', 
            'user_id', 'ip_address', 'created_at'
        },
        'analytics_events': {
            'id', 'event_type', 'user_id', 'session_id', 'properties', 'created_at'
        },
        
        # Erweiterte Tabellen
        'user_profiles': {
            'id', 'user_id', 'phone', 'mobile', 'address', 'city', 'postal_code', 
            'country', 'department', 'position', 'employee_id', 'hire_date', 
            'manager_id', 'emergency_contact', 'preferences', 'created_at', 'updated_at'
        },
        'roles': {
            'id', 'name', 'description', 'permissions', 'is_active', 'created_at', 'updated_at'
        },
        'user_roles': {
            'id', 'user_id', 'role_id', 'assigned_by', 'assigned_at', 'expires_at'
        },
        'customers': {
            'id', 'name', 'contact_person', 'email', 'phone', 'address', 'city', 
            'postal_code', 'country', 'tax_id', 'customer_type', 'credit_limit', 
            'payment_terms', 'status', 'created_at', 'updated_at'
        },
        'suppliers': {
            'id', 'name', 'contact_person', 'email', 'phone', 'address', 'city', 
            'postal_code', 'country', 'tax_id', 'payment_terms', 'credit_limit', 
            'status', 'rating', 'notes', 'created_at', 'updated_at'
        },
        'purchase_orders': {
            'id', 'po_number', 'supplier_id', 'user_id', 'order_date', 'expected_delivery', 
            'status', 'total_amount', 'currency', 'notes', 'created_at', 'updated_at'
        },
        'purchase_order_items': {
            'id', 'purchase_order_id', 'inventory_id', 'quantity', 'unit_price', 
            'total_price', 'received_quantity', 'notes', 'created_at'
        },
        'sales_orders': {
            'id', 'so_number', 'customer_id', 'user_id', 'order_date', 'expected_delivery', 
            'status', 'total_amount', 'currency', 'payment_status', 'notes', 
            'created_at', 'updated_at'
        },
        'sales_order_items': {
            'id', 'sales_order_id', 'inventory_id', 'quantity', 'unit_price', 
            'total_price', 'shipped_quantity', 'notes', 'created_at'
        },
        'invoices': {
            'id', 'invoice_number', 'customer_id', 'sales_order_id', 'user_id', 
            'invoice_date', 'due_date', 'status', 'subtotal', 'tax_amount', 
            'total_amount', 'currency', 'payment_terms', 'notes', 'created_at', 'updated_at'
        },
        'invoice_items': {
            'id', 'invoice_id', 'description', 'quantity', 'unit_price', 'total_price', 
            'tax_rate', 'created_at'
        },
        'payments': {
            'id', 'invoice_id', 'amount', 'payment_date', 'payment_method', 
            'reference_number', 'status', 'notes', 'created_at', 'updated_at'
        },
        'projects': {
            'id', 'name', 'description', 'customer_id', 'manager_id', 'start_date', 
            'end_date', 'status', 'budget', 'actual_cost', 'progress_percentage', 
            'priority', 'created_at', 'updated_at'
        },
        'project_tasks': {
            'id', 'project_id', 'name', 'description', 'assigned_to', 'start_date', 
            'due_date', 'status', 'priority', 'estimated_hours', 'actual_hours', 
            'progress_percentage', 'created_at', 'updated_at'
        },
        'time_entries': {
            'id', 'user_id', 'project_id', 'task_id', 'date', 'start_time', 'end_time', 
            'duration_hours', 'description', 'billable', 'status', 'approved_by', 
            'approved_at', 'created_at', 'updated_at'
        },
        'calendar_events': {
            'id', 'user_id', 'title', 'description', 'start_datetime', 'end_datetime', 
            'location', 'event_type', 'priority', 'is_all_day', 'is_recurring', 
            'recurrence_rule', 'attendees', 'created_at', 'updated_at'
        },
        'inventory_categories': {
            'id', 'name', 'description', 'parent_id', 'is_active', 'created_at', 'updated_at'
        },
        'inventory_movements': {
            'id', 'inventory_id', 'movement_type', 'quantity', 'reference_type', 
            'reference_id', 'from_location', 'to_location', 'user_id', 'notes', 'created_at'
        },
        'report_templates': {
            'id', 'name', 'description', 'template_type', 'query_template', 'parameters', 
            'output_format', 'is_active', 'created_by', 'created_at', 'updated_at'
        },
        'workflows': {
            'id', 'name', 'description', 'workflow_type', 'steps', 'is_active', 
            'created_by', 'created_at', 'updated_at'
        },
        'workflow_instances': {
            'id', 'workflow_id', 'entity_type', 'entity_id', 'current_step', 'status', 
            'data', 'started_by', 'started_at', 'completed_at', 'created_at', 'updated_at'
        }
    }
    
    print(f"Aktuelle Schema: {len(current_schema)} Tabellen")
    return current_schema

def normalize_table_name(name: str) -> str:
    """Normalisiert Tabellennamen für Vergleich"""
    # Entferne Sonderzeichen und konvertiere zu lowercase
    normalized = re.sub(r'[^a-zA-Z0-9_]', '_', name.lower())
    # Entferne mehrfache Unterstriche
    normalized = re.sub(r'_+', '_', normalized)
    # Entferne führende/abschließende Unterstriche
    normalized = normalized.strip('_')
    return normalized

def find_similar_tables(l3_table: str, current_tables: List[str]) -> List[str]:
    """Findet ähnliche Tabellennamen"""
    normalized_l3 = normalize_table_name(l3_table)
    similar = []
    
    for current_table in current_tables:
        normalized_current = normalize_table_name(current_table)
        
        # Exakte Übereinstimmung
        if normalized_l3 == normalized_current:
            similar.append(current_table)
        # Teilweise Übereinstimmung
        elif normalized_l3 in normalized_current or normalized_current in normalized_l3:
            similar.append(current_table)
        # Ähnliche Wörter
        elif any(word in normalized_current for word in normalized_l3.split('_')) or \
             any(word in normalized_l3 for word in normalized_current.split('_')):
            similar.append(current_table)
    
    return similar

def analyze_schema_comparison(l3_schema: Dict[str, Set[str]], current_schema: Dict[str, Set[str]]) -> Dict:
    """Führt die Schema-Vergleichsanalyse durch"""
    print("Führe Schema-Vergleich durch...")
    
    analysis = {
        'summary': {
            'l3_tables': len(l3_schema),
            'current_tables': len(current_schema),
            'matched_tables': 0,
            'unmatched_l3_tables': 0,
            'unmatched_current_tables': 0
        },
        'matched_tables': [],
        'unmatched_l3_tables': [],
        'unmatched_current_tables': [],
        'table_mappings': {},
        'missing_fields': {},
        'recommendations': []
    }
    
    current_table_names = list(current_schema.keys())
    
    # Analysiere L3-Tabellen
    for l3_table, l3_columns in l3_schema.items():
        similar_tables = find_similar_tables(l3_table, current_table_names)
        
        if similar_tables:
            # Beste Übereinstimmung finden
            best_match = similar_tables[0]
            current_columns = current_schema[best_match]
            
            # Spaltenvergleich
            common_columns = l3_columns.intersection(current_columns)
            missing_in_current = l3_columns - current_columns
            extra_in_current = current_columns - l3_columns
            
            match_info = {
                'l3_table': l3_table,
                'current_table': best_match,
                'l3_columns': len(l3_columns),
                'current_columns': len(current_columns),
                'common_columns': len(common_columns),
                'missing_columns': len(missing_in_current),
                'extra_columns': len(extra_in_current),
                'match_percentage': len(common_columns) / len(l3_columns) * 100 if l3_columns else 0,
                'missing_fields': list(missing_in_current),
                'extra_fields': list(extra_in_current)
            }
            
            analysis['matched_tables'].append(match_info)
            analysis['table_mappings'][l3_table] = best_match
            analysis['summary']['matched_tables'] += 1
            
            # Empfehlungen für fehlende Felder
            if missing_in_current:
                analysis['missing_fields'][l3_table] = list(missing_in_current)
                analysis['recommendations'].append({
                    'type': 'add_fields',
                    'table': best_match,
                    'fields': list(missing_in_current),
                    'priority': 'high' if len(missing_in_current) > 5 else 'medium'
                })
        else:
            analysis['unmatched_l3_tables'].append({
                'table': l3_table,
                'columns': len(l3_columns),
                'sample_columns': list(l3_columns)[:10]
            })
            analysis['summary']['unmatched_l3_tables'] += 1
    
    # Finde aktuelle Tabellen ohne L3-Entsprechung
    matched_current_tables = set(analysis['table_mappings'].values())
    for current_table in current_table_names:
        if current_table not in matched_current_tables:
            analysis['unmatched_current_tables'].append({
                'table': current_table,
                'columns': len(current_schema[current_table])
            })
            analysis['summary']['unmatched_current_tables'] += 1
    
    return analysis

def generate_markdown_report(analysis: Dict) -> str:
    """Generiert einen Markdown-Report"""
    report = []
    
    # Header
    report.append("# 📊 VALEO NeuroERP L3-Datenbank-Matrix-Analyse")
    report.append("")
    report.append("## 🎯 **Analyse-Zusammenfassung**")
    report.append("")
    report.append(f"- **L3-Tabellen:** {analysis['summary']['l3_tables']}")
    report.append(f"- **Aktuelle Tabellen:** {analysis['summary']['current_tables']}")
    report.append(f"- **Übereinstimmungen:** {analysis['summary']['matched_tables']}")
    report.append(f"- **Fehlende L3-Tabellen:** {analysis['summary']['unmatched_l3_tables']}")
    report.append(f"- **Zusätzliche aktuelle Tabellen:** {analysis['summary']['unmatched_current_tables']}")
    report.append("")
    
    # Übereinstimmende Tabellen
    if analysis['matched_tables']:
        report.append("## ✅ **Übereinstimmende Tabellen**")
        report.append("")
        report.append("| L3-Tabelle | Aktuelle Tabelle | Übereinstimmung | Fehlende Felder | Empfehlung |")
        report.append("|-------------|------------------|------------------|-----------------|------------|")
        
        for match in sorted(analysis['matched_tables'], key=lambda x: x['match_percentage'], reverse=True):
            status = "🟢 Vollständig" if match['match_percentage'] >= 90 else \
                    "🟡 Teilweise" if match['match_percentage'] >= 50 else "🔴 Unvollständig"
            
            missing_count = match['missing_columns']
            recommendation = "Keine Aktion" if missing_count == 0 else f"Füge {missing_count} Felder hinzu"
            
            report.append(f"| {match['l3_table']} | {match['current_table']} | {match['match_percentage']:.1f}% | {missing_count} | {recommendation} |")
        report.append("")
    
    # Fehlende L3-Tabellen
    if analysis['unmatched_l3_tables']:
        report.append("## ❌ **Fehlende L3-Tabellen**")
        report.append("")
        report.append("| L3-Tabelle | Spalten | Beispiel-Spalten | Priorität |")
        report.append("|-------------|---------|------------------|-----------|")
        
        for table in analysis['unmatched_l3_tables']:
            sample_cols = ", ".join(table['sample_columns'][:3])
            priority = "Hoch" if table['columns'] > 20 else "Mittel" if table['columns'] > 10 else "Niedrig"
            report.append(f"| {table['table']} | {table['columns']} | {sample_cols} | {priority} |")
        report.append("")
    
    # Zusätzliche aktuelle Tabellen
    if analysis['unmatched_current_tables']:
        report.append("## ➕ **Zusätzliche aktuelle Tabellen**")
        report.append("")
        report.append("| Tabelle | Spalten | Status |")
        report.append("|---------|---------|--------|")
        
        for table in analysis['unmatched_current_tables']:
            report.append(f"| {table['table']} | {table['columns']} | ✅ Implementiert |")
        report.append("")
    
    # Detaillierte Feld-Analyse
    if analysis['missing_fields']:
        report.append("## 🔍 **Detaillierte Feld-Analyse**")
        report.append("")
        
        for l3_table, missing_fields in analysis['missing_fields'].items():
            current_table = analysis['table_mappings'].get(l3_table, 'N/A')
            report.append(f"### {l3_table} → {current_table}")
            report.append("")
            report.append("**Fehlende Felder:**")
            report.append("")
            for field in missing_fields:
                report.append(f"- `{field}`")
            report.append("")
    
    # Empfehlungen
    if analysis['recommendations']:
        report.append("## 🎯 **Implementierungs-Empfehlungen**")
        report.append("")
        
        high_priority = [r for r in analysis['recommendations'] if r['priority'] == 'high']
        medium_priority = [r for r in analysis['recommendations'] if r['priority'] == 'medium']
        
        if high_priority:
            report.append("### 🔴 Hoch-Priorität")
            report.append("")
            for rec in high_priority:
                report.append(f"- **{rec['table']}:** Füge {len(rec['fields'])} Felder hinzu")
                for field in rec['fields'][:5]:  # Zeige nur erste 5
                    report.append(f"  - `{field}`")
                if len(rec['fields']) > 5:
                    report.append(f"  - ... und {len(rec['fields']) - 5} weitere")
                report.append("")
        
        if medium_priority:
            report.append("### 🟡 Mittel-Priorität")
            report.append("")
            for rec in medium_priority:
                report.append(f"- **{rec['table']}:** Füge {len(rec['fields'])} Felder hinzu")
            report.append("")
    
    # SQL-Beispiele
    if analysis['missing_fields']:
        report.append("## 💾 **SQL-Implementierungs-Beispiele**")
        report.append("")
        
        for l3_table, missing_fields in list(analysis['missing_fields'].items())[:5]:  # Nur erste 5
            current_table = analysis['table_mappings'].get(l3_table, 'N/A')
            if current_table != 'N/A':
                report.append(f"### ALTER TABLE für {current_table}")
                report.append("```sql")
                for field in missing_fields[:10]:  # Nur erste 10 Felder
                    # Schätze den Datentyp basierend auf dem Feldnamen
                    if 'date' in field.lower() or 'datum' in field.lower():
                        report.append(f"ALTER TABLE {current_table} ADD COLUMN {field} DATE;")
                    elif 'amount' in field.lower() or 'betrag' in field.lower() or 'preis' in field.lower():
                        report.append(f"ALTER TABLE {current_table} ADD COLUMN {field} DECIMAL(15,2);")
                    elif 'id' in field.lower():
                        report.append(f"ALTER TABLE {current_table} ADD COLUMN {field} UUID;")
                    elif 'text' in field.lower() or 'beschreibung' in field.lower():
                        report.append(f"ALTER TABLE {current_table} ADD COLUMN {field} TEXT;")
                    else:
                        report.append(f"ALTER TABLE {current_table} ADD COLUMN {field} VARCHAR(255);")
                report.append("```")
                report.append("")
    
    return "\n".join(report)

def main():
    """Hauptfunktion"""
    csv_path = r"C:\Users\Jochen\Desktop\L3_Uebersicht Tabellen und Spalten.csv"
    
    try:
        # Lade L3-Schema
        l3_schema = load_l3_schema(csv_path)
        
        # Lade aktuelles Schema
        current_schema = get_current_schema()
        
        # Führe Analyse durch
        analysis = analyze_schema_comparison(l3_schema, current_schema)
        
        # Generiere Report
        report = generate_markdown_report(analysis)
        
        # Speichere Report
        with open('L3_DATABASE_MATRIX_ANALYSIS.md', 'w', encoding='utf-8') as f:
            f.write(report)
        
        # Speichere JSON-Daten für weitere Verarbeitung
        with open('l3_analysis_data.json', 'w', encoding='utf-8') as f:
            json.dump(analysis, f, indent=2, ensure_ascii=False, default=str)
        
        print("✅ Analyse abgeschlossen!")
        print(f"📊 Report gespeichert: L3_DATABASE_MATRIX_ANALYSIS.md")
        print(f"📄 Daten gespeichert: l3_analysis_data.json")
        
        # Zeige Zusammenfassung
        print("\n📋 Zusammenfassung:")
        print(f"- L3-Tabellen: {analysis['summary']['l3_tables']}")
        print(f"- Aktuelle Tabellen: {analysis['summary']['current_tables']}")
        print(f"- Übereinstimmungen: {analysis['summary']['matched_tables']}")
        print(f"- Fehlende L3-Tabellen: {analysis['summary']['unmatched_l3_tables']}")
        
        if analysis['missing_fields']:
            total_missing = sum(len(fields) for fields in analysis['missing_fields'].values())
            print(f"- Fehlende Felder insgesamt: {total_missing}")
        
    except Exception as e:
        print(f"❌ Fehler bei der Analyse: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 