import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent / 'backend' / 'modules'))

from pos_system import POSSystem

class DummyDB:
    pass  # Für Mock-DB, keine echte Verbindung

def main():
    print("=== POSSystem Backend-Modul Test ===")
    pos = POSSystem(db_connection=DummyDB())

    # 1. Produkte laden
    products = pos.get_products()
    print(f"Gefundene Produkte: {len(products)}")
    for p in products:
        print(f"- {p.artikel_nr}: {p.bezeichnung} ({p.verkaufspreis_brutto} EUR)")

    # 2. Produkt zum Warenkorb hinzufügen
    if products:
        pos.add_to_cart(products[0], menge=2)
        print(f"Warenkorb nach Hinzufügen: {pos.current_cart}")

    # 3. Verkauf erstellen
    sale = pos.create_sale(zahlungsart='bar', kassierer_name='Testuser')
    print(f"Erstellter Verkauf: {sale}")
    print(f"Beleg-Template:\n{pos.get_receipt_template(sale)}")

if __name__ == "__main__":
    main() 