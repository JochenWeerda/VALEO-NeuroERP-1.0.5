from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from datetime import date, datetime
import csv
import io
import codecs

from backend.models.customer import Customer, CustomerAddress, CustomerContact

class CustomerService:
    """
    Service-Klasse für Kundenstammdaten-Operationen
    """
    
    @staticmethod
    def get_customers(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None) -> List[Customer]:
        """
        Gibt eine Liste von Kunden zurück, optional gefiltert nach Suchbegriff
        """
        query = db.query(Customer)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (Customer.name.ilike(search_term)) |
                (Customer.customer_number.ilike(search_term)) |
                (Customer.search_term.ilike(search_term)) |
                (Customer.city.ilike(search_term))
            )
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_customer_by_id(db: Session, customer_id: int) -> Optional[Customer]:
        """
        Gibt einen Kunden anhand seiner ID zurück
        """
        return db.query(Customer).filter(Customer.id == customer_id).first()
    
    @staticmethod
    def get_customer_by_number(db: Session, customer_number: str) -> Optional[Customer]:
        """
        Gibt einen Kunden anhand seiner Kundennummer zurück
        """
        return db.query(Customer).filter(Customer.customer_number == customer_number).first()
    
    @staticmethod
    def create_customer(db: Session, customer_data: Dict[str, Any]) -> Customer:
        """
        Erstellt einen neuen Kunden mit den angegebenen Daten
        """
        # Falls keine Erstellungsdatum angegeben ist, verwenden wir heute
        if 'creation_date' not in customer_data:
            customer_data['creation_date'] = date.today()
            
        # Adressen und Kontakte separat behandeln
        addresses_data = customer_data.pop('addresses', [])
        contacts_data = customer_data.pop('contacts', [])
        
        # Kunde erstellen
        db_customer = Customer(**customer_data)
        db.add(db_customer)
        db.flush()  # Um die ID zu erhalten
        
        # Adressen hinzufügen, falls vorhanden
        for address_data in addresses_data:
            address_data['customer_id'] = db_customer.id
            db_address = CustomerAddress(**address_data)
            db.add(db_address)
        
        # Kontakte hinzufügen, falls vorhanden
        for contact_data in contacts_data:
            contact_data['customer_id'] = db_customer.id
            db_contact = CustomerContact(**contact_data)
            db.add(db_contact)
        
        db.commit()
        db.refresh(db_customer)
        return db_customer
    
    @staticmethod
    def update_customer(db: Session, customer_id: int, customer_data: Dict[str, Any]) -> Optional[Customer]:
        """
        Aktualisiert einen bestehenden Kunden
        """
        db_customer = CustomerService.get_customer_by_id(db, customer_id)
        if not db_customer:
            return None
        
        # Adressen und Kontakte separat behandeln
        addresses_data = customer_data.pop('addresses', None)
        contacts_data = customer_data.pop('contacts', None)
        
        # Kundendaten aktualisieren
        for key, value in customer_data.items():
            if hasattr(db_customer, key):
                setattr(db_customer, key, value)
        
        # Adressen aktualisieren, falls angegeben
        if addresses_data is not None:
            # Bestehende Adressen löschen
            db.query(CustomerAddress).filter(CustomerAddress.customer_id == customer_id).delete()
            
            # Neue Adressen hinzufügen
            for address_data in addresses_data:
                address_data['customer_id'] = customer_id
                db_address = CustomerAddress(**address_data)
                db.add(db_address)
        
        # Kontakte aktualisieren, falls angegeben
        if contacts_data is not None:
            # Bestehende Kontakte löschen
            db.query(CustomerContact).filter(CustomerContact.customer_id == customer_id).delete()
            
            # Neue Kontakte hinzufügen
            for contact_data in contacts_data:
                contact_data['customer_id'] = customer_id
                db_contact = CustomerContact(**contact_data)
                db.add(db_contact)
        
        db.commit()
        db.refresh(db_customer)
        return db_customer
    
    @staticmethod
    def delete_customer(db: Session, customer_id: int) -> bool:
        """
        Löscht einen Kunden anhand seiner ID
        """
        db_customer = CustomerService.get_customer_by_id(db, customer_id)
        if not db_customer:
            return False
        
        db.delete(db_customer)
        db.commit()
        return True
    
    @staticmethod
    def check_for_duplicates(db: Session, name: str, postal_code: Optional[str] = None, city: Optional[str] = None) -> List[Customer]:
        """
        Prüft auf mögliche Dubletten basierend auf Name und optional PLZ/Ort
        """
        query = db.query(Customer).filter(Customer.name.ilike(f"%{name}%"))
        
        if postal_code:
            query = query.filter(Customer.postal_code == postal_code)
        
        if city:
            query = query.filter(Customer.city.ilike(f"%{city}%"))
        
        return query.all()
    
    @staticmethod
    def enrich_customer_data(customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Anreicherung von Kundendaten durch KI oder externe Dienste
        z.B. automatische Vervollständigung von Adressdaten, Branchenzuordnung, etc.
        """
        # Hier könnten externe APIs für Anreicherungen angebunden werden
        # Beispiel: Validierung und Vervollständigung von Adressdaten
        
        # Für jetzt ein einfaches Beispiel - Branche automatisch zuordnen
        if 'industry' not in customer_data or not customer_data['industry']:
            if 'name' in customer_data:
                name = customer_data['name'].lower()
                if 'landwirt' in name or 'hof' in name or 'bauernhof' in name:
                    customer_data['industry'] = 'Landwirtschaft'
                elif 'garten' in name or 'pflanzen' in name:
                    customer_data['industry'] = 'Gartenbau'
                elif 'transport' in name or 'logistik' in name or 'spedition' in name:
                    customer_data['industry'] = 'Transport & Logistik'
        
        return customer_data
    
    @staticmethod
    def import_customers_from_csv(db: Session, csv_content: str) -> Tuple[int, int, List[str]]:
        """
        Importiert Kundendaten aus einer CSV-Datei
        
        Returns:
            Tuple mit (Anzahl erfolgreicher Imports, Anzahl fehlgeschlagener Imports, Liste mit Fehlermeldungen)
        """
        # CSV-Datei parsen
        csv_reader = csv.DictReader(io.StringIO(csv_content), delimiter=';')
        
        # Zähler initialisieren
        success_count = 0
        error_count = 0
        error_messages = []
        
        for row_num, row in enumerate(csv_reader, start=2):  # Start bei 2, da Zeile 1 die Header sind
            try:
                # Pflichtfelder prüfen
                if not row.get('customer_number') or not row.get('name'):
                    error_count += 1
                    error_messages.append(f"Zeile {row_num}: Kundennummer und Name sind Pflichtfelder")
                    continue
                
                # Prüfen, ob Kunde bereits existiert
                existing = CustomerService.get_customer_by_number(db, row.get('customer_number'))
                if existing:
                    # Existierenden Kunden aktualisieren
                    customer_data = {
                        'customer_number': row.get('customer_number'),
                        'debitor_account': row.get('debitor_account') or row.get('customer_number'),
                        'name': row.get('name'),
                        'name2': row.get('name2', ''),
                        'industry': row.get('industry', ''),
                        'street': row.get('street', ''),
                        'country': row.get('country', 'DE'),
                        'postal_code': row.get('postal_code', ''),
                        'city': row.get('city', ''),
                        'phone1': row.get('phone', ''),
                        'email': row.get('email', ''),
                        'is_active': True
                    }
                    
                    # Daten anreichern
                    enriched_data = CustomerService.enrich_customer_data(customer_data)
                    
                    # Kunden aktualisieren
                    CustomerService.update_customer(db, existing.id, enriched_data)
                    success_count += 1
                else:
                    # Neuen Kunden erstellen
                    customer_data = {
                        'customer_number': row.get('customer_number'),
                        'debitor_account': row.get('debitor_account') or row.get('customer_number'),
                        'name': row.get('name'),
                        'name2': row.get('name2', ''),
                        'industry': row.get('industry', ''),
                        'street': row.get('street', ''),
                        'country': row.get('country', 'DE'),
                        'postal_code': row.get('postal_code', ''),
                        'city': row.get('city', ''),
                        'phone1': row.get('phone', ''),
                        'email': row.get('email', ''),
                        'creation_date': date.today(),
                        'is_active': True
                    }
                    
                    # Daten anreichern
                    enriched_data = CustomerService.enrich_customer_data(customer_data)
                    
                    # Kunden erstellen
                    CustomerService.create_customer(db, enriched_data)
                    success_count += 1
                    
            except Exception as e:
                error_count += 1
                error_messages.append(f"Zeile {row_num}: {str(e)}")
        
        return (success_count, error_count, error_messages)
    
    @staticmethod
    def export_customers_to_csv(db: Session) -> str:
        """
        Exportiert alle Kunden als CSV-String
        """
        customers = CustomerService.get_customers(db, skip=0, limit=10000)
        
        # CSV-Header
        fieldnames = [
            'customer_number', 'debitor_account', 'name', 'name2', 'industry',
            'street', 'country', 'postal_code', 'city', 'phone1', 'phone2',
            'email', 'website', 'is_active'
        ]
        
        # CSV erstellen
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=fieldnames, delimiter=';')
        writer.writeheader()
        
        for customer in customers:
            writer.writerow({
                'customer_number': customer.customer_number,
                'debitor_account': customer.debitor_account,
                'name': customer.name,
                'name2': customer.name2 or '',
                'industry': customer.industry or '',
                'street': customer.street or '',
                'country': customer.country or 'DE',
                'postal_code': customer.postal_code or '',
                'city': customer.city or '',
                'phone1': customer.phone1 or '',
                'phone2': customer.phone2 or '',
                'email': customer.email or '',
                'website': customer.website or '',
                'is_active': 'Ja' if customer.is_active else 'Nein'
            })
        
        return output.getvalue() 