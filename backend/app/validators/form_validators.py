"""
Formular-Validatoren für VALEO NeuroERP
Zentrale Validierungslogik für alle Eingabemasken
"""

import re
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, date
from decimal import Decimal
from pydantic import BaseModel, validator, Field
from email_validator import validate_email, EmailNotValidError

class ValidationError(Exception):
    """Custom Validation Error mit Details"""
    def __init__(self, field: str, message: str, code: str = "invalid"):
        self.field = field
        self.message = message
        self.code = code
        super().__init__(f"{field}: {message}")

class ValidationResult:
    """Ergebnis einer Validierung"""
    def __init__(self):
        self.errors: Dict[str, List[str]] = {}
        self.warnings: Dict[str, List[str]] = {}
    
    def add_error(self, field: str, message: str):
        if field not in self.errors:
            self.errors[field] = []
        self.errors[field].append(message)
    
    def add_warning(self, field: str, message: str):
        if field not in self.warnings:
            self.warnings[field] = []
        self.warnings[field].append(message)
    
    @property
    def is_valid(self) -> bool:
        return len(self.errors) == 0
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "valid": self.is_valid,
            "errors": self.errors,
            "warnings": self.warnings
        }

class BaseValidator:
    """Basis-Validator-Klasse"""
    
    @staticmethod
    def validate_required(value: Any, field_name: str) -> None:
        """Prüft ob ein Feld ausgefüllt ist"""
        if value is None or (isinstance(value, str) and not value.strip()):
            raise ValidationError(field_name, "Dieses Feld ist erforderlich", "required")
    
    @staticmethod
    def validate_length(value: str, field_name: str, min_length: Optional[int] = None, 
                       max_length: Optional[int] = None) -> None:
        """Prüft die Länge eines Strings"""
        if not isinstance(value, str):
            return
        
        if min_length and len(value) < min_length:
            raise ValidationError(field_name, f"Mindestens {min_length} Zeichen erforderlich", "min_length")
        
        if max_length and len(value) > max_length:
            raise ValidationError(field_name, f"Maximal {max_length} Zeichen erlaubt", "max_length")
    
    @staticmethod
    def validate_email(email: str, field_name: str = "email") -> None:
        """Validiert eine E-Mail-Adresse"""
        try:
            validate_email(email)
        except EmailNotValidError:
            raise ValidationError(field_name, "Ungültige E-Mail-Adresse", "invalid_email")
    
    @staticmethod
    def validate_phone(phone: str, field_name: str = "phone") -> None:
        """Validiert eine Telefonnummer (deutsch/international)"""
        # Entferne alle Leerzeichen, Bindestriche und Klammern
        cleaned = re.sub(r'[\s\-\(\)]', '', phone)
        
        # Prüfe deutsches Format oder internationales Format
        patterns = [
            r'^\+49\d{10,11}$',  # International deutsch
            r'^0\d{10,11}$',     # National deutsch
            r'^\+\d{10,15}$',    # International allgemein
        ]
        
        if not any(re.match(pattern, cleaned) for pattern in patterns):
            raise ValidationError(field_name, "Ungültige Telefonnummer", "invalid_phone")
    
    @staticmethod
    def validate_date(value: Union[str, date, datetime], field_name: str,
                     min_date: Optional[date] = None, max_date: Optional[date] = None) -> date:
        """Validiert ein Datum"""
        if isinstance(value, str):
            try:
                parsed_date = datetime.strptime(value, "%Y-%m-%d").date()
            except ValueError:
                raise ValidationError(field_name, "Ungültiges Datumsformat (YYYY-MM-DD erwartet)", "invalid_date")
        elif isinstance(value, datetime):
            parsed_date = value.date()
        elif isinstance(value, date):
            parsed_date = value
        else:
            raise ValidationError(field_name, "Ungültiger Datumstyp", "invalid_type")
        
        if min_date and parsed_date < min_date:
            raise ValidationError(field_name, f"Datum darf nicht vor {min_date} liegen", "date_too_early")
        
        if max_date and parsed_date > max_date:
            raise ValidationError(field_name, f"Datum darf nicht nach {max_date} liegen", "date_too_late")
        
        return parsed_date
    
    @staticmethod
    def validate_decimal(value: Union[str, float, Decimal], field_name: str,
                        min_value: Optional[Decimal] = None, max_value: Optional[Decimal] = None,
                        decimal_places: Optional[int] = None) -> Decimal:
        """Validiert eine Dezimalzahl"""
        try:
            if isinstance(value, str):
                # Ersetze Komma durch Punkt für deutsche Zahlenformate
                value = value.replace(',', '.')
            decimal_value = Decimal(str(value))
        except:
            raise ValidationError(field_name, "Ungültige Zahl", "invalid_number")
        
        if min_value is not None and decimal_value < min_value:
            raise ValidationError(field_name, f"Wert muss mindestens {min_value} sein", "min_value")
        
        if max_value is not None and decimal_value > max_value:
            raise ValidationError(field_name, f"Wert darf maximal {max_value} sein", "max_value")
        
        if decimal_places is not None:
            # Prüfe Anzahl der Nachkommastellen
            sign, digits, exponent = decimal_value.as_tuple()
            if exponent < -decimal_places:
                raise ValidationError(field_name, f"Maximal {decimal_places} Nachkommastellen erlaubt", "decimal_places")
        
        return decimal_value
    
    @staticmethod
    def validate_iban(iban: str, field_name: str = "iban") -> None:
        """Validiert eine IBAN"""
        # Entferne Leerzeichen
        iban = iban.replace(' ', '').upper()
        
        # Längenprüfung für Deutschland
        if not re.match(r'^DE\d{20}$', iban):
            raise ValidationError(field_name, "Ungültige deutsche IBAN", "invalid_iban")
        
        # IBAN Mod-97 Prüfung
        # Verschiebe die ersten 4 Zeichen ans Ende
        rearranged = iban[4:] + iban[:4]
        
        # Ersetze Buchstaben durch Zahlen (A=10, B=11, ..., Z=35)
        numeric_iban = ''
        for char in rearranged:
            if char.isdigit():
                numeric_iban += char
            else:
                numeric_iban += str(ord(char) - ord('A') + 10)
        
        # Mod-97 Prüfung
        if int(numeric_iban) % 97 != 1:
            raise ValidationError(field_name, "IBAN-Prüfsumme ungültig", "invalid_iban_checksum")
    
    @staticmethod
    def validate_bic(bic: str, field_name: str = "bic") -> None:
        """Validiert einen BIC/SWIFT-Code"""
        if not re.match(r'^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$', bic.upper()):
            raise ValidationError(field_name, "Ungültiger BIC/SWIFT-Code", "invalid_bic")

class CustomerValidator(BaseValidator):
    """Validator für Kundendaten"""
    
    @classmethod
    def validate(cls, data: Dict[str, Any]) -> ValidationResult:
        result = ValidationResult()
        
        # Pflichtfelder
        required_fields = ['name', 'address', 'city', 'postal_code']
        for field in required_fields:
            try:
                cls.validate_required(data.get(field), field)
            except ValidationError as e:
                result.add_error(e.field, e.message)
        
        # E-Mail validieren wenn vorhanden
        if data.get('email'):
            try:
                cls.validate_email(data['email'])
            except ValidationError as e:
                result.add_error(e.field, e.message)
        
        # Telefon validieren wenn vorhanden
        if data.get('phone'):
            try:
                cls.validate_phone(data['phone'])
            except ValidationError as e:
                result.add_error(e.field, e.message)
        
        # PLZ validieren (5-stellig für Deutschland)
        if data.get('postal_code'):
            if not re.match(r'^\d{5}$', str(data['postal_code'])):
                result.add_error('postal_code', 'PLZ muss 5-stellig sein')
        
        # Kreditlimit validieren
        if data.get('credit_limit'):
            try:
                credit = cls.validate_decimal(data['credit_limit'], 'credit_limit', 
                                            min_value=Decimal('0'), decimal_places=2)
                if credit > Decimal('1000000'):
                    result.add_warning('credit_limit', 'Ungewöhnlich hohes Kreditlimit')
            except ValidationError as e:
                result.add_error(e.field, e.message)
        
        return result

class ArticleValidator(BaseValidator):
    """Validator für Artikeldaten"""
    
    @classmethod
    def validate(cls, data: Dict[str, Any]) -> ValidationResult:
        result = ValidationResult()
        
        # Pflichtfelder
        required_fields = ['article_number', 'description', 'unit', 'price']
        for field in required_fields:
            try:
                cls.validate_required(data.get(field), field)
            except ValidationError as e:
                result.add_error(e.field, e.message)
        
        # Artikelnummer Format
        if data.get('article_number'):
            if not re.match(r'^[A-Z0-9\-]+$', str(data['article_number'])):
                result.add_error('article_number', 'Artikelnummer darf nur Großbuchstaben, Zahlen und Bindestriche enthalten')
        
        # Preis validieren
        if data.get('price'):
            try:
                price = cls.validate_decimal(data['price'], 'price', 
                                           min_value=Decimal('0'), decimal_places=2)
            except ValidationError as e:
                result.add_error(e.field, e.message)
        
        # Lagerbestand validieren
        if 'stock' in data:
            try:
                stock = cls.validate_decimal(data['stock'], 'stock', 
                                           min_value=Decimal('0'), decimal_places=0)
                if stock < data.get('min_stock', 0):
                    result.add_warning('stock', 'Lagerbestand unter Mindestbestand')
            except ValidationError as e:
                result.add_error(e.field, e.message)
        
        # EAN validieren wenn vorhanden
        if data.get('ean'):
            if not re.match(r'^\d{13}$', str(data['ean'])):
                result.add_error('ean', 'EAN muss 13-stellig sein')
        
        return result

class InvoiceValidator(BaseValidator):
    """Validator für Rechnungsdaten"""
    
    @classmethod
    def validate(cls, data: Dict[str, Any]) -> ValidationResult:
        result = ValidationResult()
        
        # Pflichtfelder
        required_fields = ['customer_id', 'invoice_date', 'positions']
        for field in required_fields:
            try:
                cls.validate_required(data.get(field), field)
            except ValidationError as e:
                result.add_error(e.field, e.message)
        
        # Rechnungsdatum validieren
        if data.get('invoice_date'):
            try:
                invoice_date = cls.validate_date(data['invoice_date'], 'invoice_date',
                                               max_date=date.today())
            except ValidationError as e:
                result.add_error(e.field, e.message)
        
        # Fälligkeitsdatum validieren
        if data.get('due_date') and data.get('invoice_date'):
            try:
                due_date = cls.validate_date(data['due_date'], 'due_date')
                invoice_date = cls.validate_date(data['invoice_date'], 'invoice_date')
                if due_date < invoice_date:
                    result.add_error('due_date', 'Fälligkeitsdatum darf nicht vor Rechnungsdatum liegen')
            except ValidationError as e:
                result.add_error(e.field, e.message)
        
        # Positionen validieren
        if data.get('positions'):
            if not isinstance(data['positions'], list) or len(data['positions']) == 0:
                result.add_error('positions', 'Mindestens eine Position erforderlich')
            else:
                for i, pos in enumerate(data['positions']):
                    pos_result = cls._validate_invoice_position(pos, i)
                    for field, errors in pos_result.errors.items():
                        for error in errors:
                            result.add_error(f'positions[{i}].{field}', error)
        
        # Gesamtsumme prüfen
        if data.get('total_amount'):
            try:
                total = cls.validate_decimal(data['total_amount'], 'total_amount',
                                           min_value=Decimal('0'), decimal_places=2)
                # Berechne erwartete Summe aus Positionen
                if data.get('positions'):
                    calculated_total = sum(
                        Decimal(str(pos.get('quantity', 0))) * Decimal(str(pos.get('price', 0)))
                        for pos in data['positions']
                    )
                    if abs(total - calculated_total) > Decimal('0.01'):
                        result.add_error('total_amount', 'Gesamtsumme stimmt nicht mit Positionen überein')
            except ValidationError as e:
                result.add_error(e.field, e.message)
        
        return result
    
    @classmethod
    def _validate_invoice_position(cls, position: Dict[str, Any], index: int) -> ValidationResult:
        """Validiert eine einzelne Rechnungsposition"""
        result = ValidationResult()
        
        # Pflichtfelder für Position
        required = ['article_id', 'quantity', 'price']
        for field in required:
            if not position.get(field):
                result.add_error(field, 'Dieses Feld ist erforderlich')
        
        # Menge validieren
        if position.get('quantity'):
            try:
                qty = cls.validate_decimal(position['quantity'], 'quantity',
                                         min_value=Decimal('0.001'), decimal_places=3)
            except ValidationError as e:
                result.add_error(e.field, e.message)
        
        # Preis validieren
        if position.get('price'):
            try:
                price = cls.validate_decimal(position['price'], 'price',
                                           min_value=Decimal('0'), decimal_places=2)
            except ValidationError as e:
                result.add_error(e.field, e.message)
        
        # Rabatt validieren
        if position.get('discount'):
            try:
                discount = cls.validate_decimal(position['discount'], 'discount',
                                              min_value=Decimal('0'), max_value=Decimal('100'),
                                              decimal_places=2)
            except ValidationError as e:
                result.add_error(e.field, e.message)
        
        return result

class BankAccountValidator(BaseValidator):
    """Validator für Bankverbindungen"""
    
    @classmethod
    def validate(cls, data: Dict[str, Any]) -> ValidationResult:
        result = ValidationResult()
        
        # IBAN validieren
        if data.get('iban'):
            try:
                cls.validate_iban(data['iban'])
            except ValidationError as e:
                result.add_error(e.field, e.message)
        else:
            result.add_error('iban', 'IBAN ist erforderlich')
        
        # BIC validieren
        if data.get('bic'):
            try:
                cls.validate_bic(data['bic'])
            except ValidationError as e:
                result.add_error(e.field, e.message)
        
        # Kontoinhaber
        if not data.get('account_holder'):
            result.add_error('account_holder', 'Kontoinhaber ist erforderlich')
        
        return result

# Formular-spezifische Validatoren als Pydantic Models

class CustomerFormModel(BaseModel):
    """Pydantic Model für Kundenformular"""
    name: str = Field(..., min_length=1, max_length=100)
    address: str = Field(..., min_length=1)
    city: str = Field(..., min_length=1)
    postal_code: str = Field(..., regex=r'^\d{5}$')
    country: str = Field(default="DE")
    email: Optional[str] = None
    phone: Optional[str] = None
    credit_limit: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    
    @validator('email')
    def validate_email(cls, v):
        if v:
            try:
                validate_email(v)
            except EmailNotValidError:
                raise ValueError('Ungültige E-Mail-Adresse')
        return v

class ArticleFormModel(BaseModel):
    """Pydantic Model für Artikelformular"""
    article_number: str = Field(..., regex=r'^[A-Z0-9\-]+$')
    description: str = Field(..., min_length=1, max_length=200)
    unit: str = Field(..., min_length=1)
    price: Decimal = Field(..., ge=0, decimal_places=2)
    stock: Decimal = Field(default=0, ge=0, decimal_places=0)
    min_stock: Decimal = Field(default=0, ge=0, decimal_places=0)
    ean: Optional[str] = Field(None, regex=r'^\d{13}$')
    
    @validator('stock')
    def validate_stock(cls, v, values):
        if 'min_stock' in values and v < values['min_stock']:
            # Nur eine Warnung, kein Fehler
            pass
        return v