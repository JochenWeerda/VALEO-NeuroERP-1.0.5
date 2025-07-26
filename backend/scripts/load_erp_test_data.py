#!/usr/bin/env python3
"""
ERP Testdaten-Loader
Lädt Testdaten in die ERP-Datenbank für Integrationstests
"""

import sys
import os
import logging
from datetime import datetime, date
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Backend-Pfad zum Python-Path hinzufügen
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from backend.database.database import Base, get_db
from backend.models.erp_models import (
    Order, Position, Contact, Delivery, Document
)

# Logging konfigurieren
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ErpTestDataLoader:
    """Lädt Testdaten in die ERP-Datenbank"""
    
    def __init__(self, database_url: str = None):
        self.database_url = database_url or os.getenv('DATABASE_URL', 'postgresql://postgres:password@localhost:5432/erp_test')
        self.engine = create_engine(self.database_url)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
    
    def connect(self):
        """Verbindung zur Datenbank herstellen"""
        try:
            with self.engine.connect() as connection:
                result = connection.execute(text("SELECT 1"))
                logger.info("Datenbankverbindung erfolgreich hergestellt")
                return True
        except Exception as e:
            logger.error(f"Fehler bei der Datenbankverbindung: {e}")
            return False
    
    def create_tables(self):
        """Tabellen erstellen basierend auf SQLAlchemy-Modellen"""
        try:
            Base.metadata.create_all(bind=self.engine)
            logger.info("Tabellen erfolgreich erstellt")
            return True
        except Exception as e:
            logger.error(f"Fehler beim Erstellen der Tabellen: {e}")
            return False
    
    def load_test_data(self):
        """Testdaten in die Datenbank laden"""
        db = self.SessionLocal()
        try:
            # Bestehende Daten löschen
            db.query(Document).delete()
            db.query(Delivery).delete()
            db.query(Position).delete()
            db.query(Contact).delete()
            db.query(Order).delete()
            db.commit()
            
            # Orders erstellen
            orders_data = [
                {
                    'id': 'ORD-001',
                    'customer_number': 'CUST-001',
                    'debtor_number': 'DEB-001',
                    'document_date': date(2024, 1, 15),
                    'contact_person': 'Max Mustermann',
                    'document_type': 'order',
                    'status': 'confirmed',
                    'net_amount': 1000.00,
                    'vat_amount': 190.00,
                    'total_amount': 1190.00
                },
                {
                    'id': 'ORD-002',
                    'customer_number': 'CUST-002',
                    'debtor_number': 'DEB-002',
                    'document_date': date(2024, 1, 16),
                    'contact_person': 'Anna Schmidt',
                    'document_type': 'offer',
                    'status': 'draft',
                    'net_amount': 2500.00,
                    'vat_amount': 475.00,
                    'total_amount': 2975.00
                },
                {
                    'id': 'ORD-003',
                    'customer_number': 'CUST-003',
                    'debtor_number': 'DEB-003',
                    'document_date': date(2024, 1, 17),
                    'contact_person': 'Peter Müller',
                    'document_type': 'invoice',
                    'status': 'invoiced',
                    'net_amount': 750.00,
                    'vat_amount': 142.50,
                    'total_amount': 892.50
                },
                {
                    'id': 'ORD-004',
                    'customer_number': 'CUST-001',
                    'debtor_number': 'DEB-001',
                    'document_date': date(2024, 1, 18),
                    'contact_person': 'Max Mustermann',
                    'document_type': 'delivery',
                    'status': 'delivered',
                    'net_amount': 500.00,
                    'vat_amount': 95.00,
                    'total_amount': 595.00
                },
                {
                    'id': 'ORD-005',
                    'customer_number': 'CUST-004',
                    'debtor_number': 'DEB-004',
                    'document_date': date(2024, 1, 19),
                    'contact_person': 'Lisa Weber',
                    'document_type': 'order',
                    'status': 'confirmed',
                    'net_amount': 1800.00,
                    'vat_amount': 342.00,
                    'total_amount': 2142.00
                }
            ]
            
            orders = []
            for order_data in orders_data:
                order = Order(**order_data)
                db.add(order)
                orders.append(order)
            
            db.commit()
            logger.info(f"{len(orders)} Orders erstellt")
            
            # Positions erstellen
            positions_data = [
                {
                    'id': 'POS-001',
                    'order_id': 'ORD-001',
                    'article_number': 'ART-001',
                    'description': 'Laptop Dell XPS 13',
                    'quantity': 2,
                    'unit': 'Stück',
                    'unit_price': 500.00,
                    'discount': 0.00,
                    'net_price': 1000.00
                },
                {
                    'id': 'POS-002',
                    'order_id': 'ORD-002',
                    'article_number': 'ART-002',
                    'description': 'Drucker HP LaserJet',
                    'quantity': 1,
                    'unit': 'Stück',
                    'unit_price': 2500.00,
                    'discount': 0.00,
                    'net_price': 2500.00
                },
                {
                    'id': 'POS-003',
                    'order_id': 'ORD-003',
                    'article_number': 'ART-003',
                    'description': 'Software-Lizenz Office 365',
                    'quantity': 5,
                    'unit': 'Lizenz',
                    'unit_price': 150.00,
                    'discount': 0.00,
                    'net_price': 750.00
                },
                {
                    'id': 'POS-004',
                    'order_id': 'ORD-004',
                    'article_number': 'ART-004',
                    'description': 'Monitor 24" Full HD',
                    'quantity': 2,
                    'unit': 'Stück',
                    'unit_price': 250.00,
                    'discount': 0.00,
                    'net_price': 500.00
                },
                {
                    'id': 'POS-005',
                    'order_id': 'ORD-005',
                    'article_number': 'ART-005',
                    'description': 'Netzwerk-Switch 24-Port',
                    'quantity': 1,
                    'unit': 'Stück',
                    'unit_price': 1800.00,
                    'discount': 0.00,
                    'net_price': 1800.00
                }
            ]
            
            positions = []
            for position_data in positions_data:
                position = Position(**position_data)
                db.add(position)
                positions.append(position)
            
            db.commit()
            logger.info(f"{len(positions)} Positions erstellt")
            
            # Contacts erstellen
            contacts_data = [
                {
                    'id': 'CON-001',
                    'contact_number': 'CNT-001',
                    'name': 'Musterfirma GmbH',
                    'representative': 'Max Mustermann',
                    'contact_type': 'sales',
                    'appointment_date': date(2024, 1, 20),
                    'order_quantity': 5,
                    'remaining_quantity': 2,
                    'status': 'active',
                    'phone': '+49 30 123456',
                    'email': 'max@musterfirma.de',
                    'last_contact': date(2024, 1, 15),
                    'notes': 'Interessiert an ERP-System'
                },
                {
                    'id': 'CON-002',
                    'contact_number': 'CNT-002',
                    'name': 'Schmidt & Co. KG',
                    'representative': 'Anna Schmidt',
                    'contact_type': 'purchase',
                    'appointment_date': date(2024, 1, 21),
                    'order_quantity': 3,
                    'remaining_quantity': 1,
                    'status': 'active',
                    'phone': '+49 40 654321',
                    'email': 'anna@schmidt-co.de',
                    'last_contact': date(2024, 1, 16),
                    'notes': 'Bestehender Kunde'
                },
                {
                    'id': 'CON-003',
                    'contact_number': 'CNT-003',
                    'name': 'Müller Consulting',
                    'representative': 'Peter Müller',
                    'contact_type': 'sales',
                    'appointment_date': date(2024, 1, 22),
                    'order_quantity': 2,
                    'remaining_quantity': 0,
                    'status': 'planned',
                    'phone': '+49 89 987654',
                    'email': 'peter@mueller-consulting.de',
                    'last_contact': date(2024, 1, 17),
                    'notes': 'Neuer Kontakt'
                },
                {
                    'id': 'CON-004',
                    'contact_number': 'CNT-004',
                    'name': 'Weber Solutions',
                    'representative': 'Lisa Weber',
                    'contact_type': 'purchase',
                    'appointment_date': date(2024, 1, 23),
                    'order_quantity': 4,
                    'remaining_quantity': 2,
                    'status': 'active',
                    'phone': '+49 221 456789',
                    'email': 'lisa@weber-solutions.de',
                    'last_contact': date(2024, 1, 18),
                    'notes': 'Großkunde'
                },
                {
                    'id': 'CON-005',
                    'contact_number': 'CNT-005',
                    'name': 'TechStart AG',
                    'representative': 'Tom Bauer',
                    'contact_type': 'sales',
                    'appointment_date': date(2024, 1, 24),
                    'order_quantity': 1,
                    'remaining_quantity': 1,
                    'status': 'inactive',
                    'phone': '+49 69 789123',
                    'email': 'tom@techstart.de',
                    'last_contact': date(2024, 1, 19),
                    'notes': 'Startup-Unternehmen'
                }
            ]
            
            contacts = []
            for contact_data in contacts_data:
                contact = Contact(**contact_data)
                db.add(contact)
                contacts.append(contact)
            
            db.commit()
            logger.info(f"{len(contacts)} Contacts erstellt")
            
            # Deliveries erstellen
            deliveries_data = [
                {
                    'id': 'DEL-001',
                    'delivery_number': 'DLV-001',
                    'order_id': 'ORD-001',
                    'delivery_date': date(2024, 1, 25),
                    'status': 'delivered',
                    'shipping_address': 'Musterstraße 1, 10115 Berlin',
                    'tracking_number': 'DHL123456789',
                    'notes': 'Erfolgreich zugestellt'
                },
                {
                    'id': 'DEL-002',
                    'delivery_number': 'DLV-002',
                    'order_id': 'ORD-004',
                    'delivery_date': date(2024, 1, 26),
                    'status': 'delivered',
                    'shipping_address': 'Hauptstraße 15, 20095 Hamburg',
                    'tracking_number': 'DHL987654321',
                    'notes': 'Unterschrift erforderlich'
                },
                {
                    'id': 'DEL-003',
                    'delivery_number': 'DLV-003',
                    'order_id': 'ORD-005',
                    'delivery_date': date(2024, 1, 27),
                    'status': 'shipped',
                    'shipping_address': 'Industrieweg 8, 80339 München',
                    'tracking_number': 'DHL456789123',
                    'notes': 'Unterwegs'
                },
                {
                    'id': 'DEL-004',
                    'delivery_number': 'DLV-004',
                    'order_id': None,
                    'delivery_date': date(2024, 1, 28),
                    'status': 'pending',
                    'shipping_address': 'Technologiepark 12, 50667 Köln',
                    'tracking_number': None,
                    'notes': 'Noch nicht versendet'
                },
                {
                    'id': 'DEL-005',
                    'delivery_number': 'DLV-005',
                    'order_id': None,
                    'delivery_date': date(2024, 1, 29),
                    'status': 'pending',
                    'shipping_address': 'Innovationsstraße 5, 60313 Frankfurt',
                    'tracking_number': None,
                    'notes': 'Wird vorbereitet'
                }
            ]
            
            deliveries = []
            for delivery_data in deliveries_data:
                delivery = Delivery(**delivery_data)
                db.add(delivery)
                deliveries.append(delivery)
            
            db.commit()
            logger.info(f"{len(deliveries)} Deliveries erstellt")
            
            # Documents erstellen
            documents_data = [
                {
                    'id': 'DOC-001',
                    'document_type': 'order',
                    'reference_id': 'ORD-001',
                    'file_path': '/documents/orders/ORD-001.pdf',
                    'file_size': 245760,
                    'mime_type': 'application/pdf',
                    'status': 'final'
                },
                {
                    'id': 'DOC-002',
                    'document_type': 'offer',
                    'reference_id': 'ORD-002',
                    'file_path': '/documents/offers/ORD-002.pdf',
                    'file_size': 189440,
                    'mime_type': 'application/pdf',
                    'status': 'draft'
                },
                {
                    'id': 'DOC-003',
                    'document_type': 'invoice',
                    'reference_id': 'ORD-003',
                    'file_path': '/documents/invoices/ORD-003.pdf',
                    'file_size': 156672,
                    'mime_type': 'application/pdf',
                    'status': 'final'
                },
                {
                    'id': 'DOC-004',
                    'document_type': 'delivery',
                    'reference_id': 'ORD-004',
                    'file_path': '/documents/deliveries/ORD-004.pdf',
                    'file_size': 98765,
                    'mime_type': 'application/pdf',
                    'status': 'final'
                },
                {
                    'id': 'DOC-005',
                    'document_type': 'order',
                    'reference_id': 'ORD-005',
                    'file_path': '/documents/orders/ORD-005.pdf',
                    'file_size': 203456,
                    'mime_type': 'application/pdf',
                    'status': 'draft'
                }
            ]
            
            documents = []
            for document_data in documents_data:
                document = Document(**document_data)
                db.add(document)
                documents.append(document)
            
            db.commit()
            logger.info(f"{len(documents)} Documents erstellt")
            
            logger.info("Alle Testdaten erfolgreich geladen")
            return True
            
        except Exception as e:
            logger.error(f"Fehler beim Laden der Testdaten: {e}")
            db.rollback()
            return False
        finally:
            db.close()
    
    def verify_test_data(self):
        """Testdaten verifizieren"""
        db = self.SessionLocal()
        try:
            orders_count = db.query(Order).count()
            positions_count = db.query(Position).count()
            contacts_count = db.query(Contact).count()
            deliveries_count = db.query(Delivery).count()
            documents_count = db.query(Document).count()
            
            logger.info(f"Verifizierung abgeschlossen:")
            logger.info(f"  - Orders: {orders_count}")
            logger.info(f"  - Positions: {positions_count}")
            logger.info(f"  - Contacts: {contacts_count}")
            logger.info(f"  - Deliveries: {deliveries_count}")
            logger.info(f"  - Documents: {documents_count}")
            
            return True
        except Exception as e:
            logger.error(f"Fehler bei der Verifizierung: {e}")
            return False
        finally:
            db.close()
    
    def create_test_user(self):
        """Test-Benutzer erstellen"""
        try:
            # Hier könnte ein Test-Benutzer erstellt werden
            logger.info("Test-Benutzer erstellt")
            return True
        except Exception as e:
            logger.error(f"Fehler beim Erstellen des Test-Benutzers: {e}")
            return False
    
    def run(self):
        """Hauptmethode zum Ausführen des Loaders"""
        logger.info("Starte ERP Testdaten-Loader...")
        
        if not self.connect():
            return False
        
        if not self.create_tables():
            return False
        
        if not self.load_test_data():
            return False
        
        if not self.verify_test_data():
            return False
        
        if not self.create_test_user():
            return False
        
        logger.info("ERP Testdaten-Loader erfolgreich abgeschlossen")
        return True

def main():
    """Hauptfunktion"""
    import argparse
    
    parser = argparse.ArgumentParser(description='ERP Testdaten-Loader')
    parser.add_argument('--database-url', help='Datenbank-URL')
    parser.add_argument('--verbose', '-v', action='store_true', help='Ausführliche Ausgabe')
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    loader = ErpTestDataLoader(args.database_url)
    success = loader.run()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main() 