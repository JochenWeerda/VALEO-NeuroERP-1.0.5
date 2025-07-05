"""
Erweitertes Artikel-Stammdatenmodell für das AI-gestützte ERP-System.

Dieses Modul implementiert ein umfassendes Stammdatenmodell für Artikel mit KI-Erweiterungen.
Es baut auf dem Basismodell in artikel.py auf und erweitert es um zusätzliche Felder und Funktionen.
"""

from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Text, JSON, Date
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declared_attr
from datetime import datetime

# Versuche verschiedene Import-Pfade
try:
    from backend.db.base import Base
except ImportError:
    try:
        from backend.app.db.base import Base
    except ImportError:
        from app.db.base import Base

try:
    from backend.models.artikel import Artikel
except ImportError:
    try:
        from backend.app.models.artikel import Artikel
    except ImportError:
        from app.models.artikel import Artikel


class ArtikelStammdaten(Base):
    """Erweiterte Stammdaten für Artikel"""
    __tablename__ = "artikel_stammdaten"
    
    id = Column(Integer, primary_key=True, index=True)
    artikel_id = Column(Integer, ForeignKey("artikel.id"), nullable=False, unique=True)
    
    # Allgemeine Daten
    kurztext = Column(String(100), nullable=True)
    zweite_matchcode = Column(String(100), nullable=True)
    artikel_art = Column(String(50), nullable=True)
    artikel_gruppe = Column(String(50), nullable=True)
    artikel_gesperrt = Column(Boolean, nullable=False, default=False)
    
    # Druckbeschreibung als JSON
    druck_beschreibung = Column(JSON, nullable=True, default={
        "aufAnfrageBestell": False,
        "aufAngebot": False,
        "aufAuftragsbest": False,
        "aufLieferschein": False,
        "aufRechnung": False,
        "aufKontrakt": False,
        "aufWiegeschein": False
    })
    
    # Anzeigeoptionen als JSON
    anzeigeoptionen = Column(JSON, nullable=True, default={
        "stattArtikelBezeichnung": False,
        "zusätzlich": False,
        "langtextImGrafik": False,
        "langtextInklFormeln": False
    })
    
    # Einheiten
    mengen_einheit = Column(String(20), nullable=True)
    gewicht = Column(Float, nullable=True)
    hilfsgewicht = Column(Float, nullable=True)
    preis_je = Column(String(20), nullable=True)
    verpackungseinheit = Column(String(50), nullable=True)
    verpackung = Column(String(100), nullable=True)
    
    # Gebinde als JSON
    gebinde = Column(JSON, nullable=True, default={
        "einheit": "",
        "menge": 0.0
    })
    
    # Steuer als JSON
    steuer = Column(JSON, nullable=True, default={
        "steuerschlüssel": 0.0,
        "bewertungsart": "",
        "bewertungsProzent": 0.0
    })
    
    # Alternativen
    haupt_artikel_id = Column(Integer, ForeignKey("artikel.id"), nullable=True)
    
    # Kennzeichnung
    ean_code = Column(String(50), nullable=True)
    ean_code_einheit = Column(String(50), nullable=True)
    interner_code = Column(String(50), nullable=True)
    sichtbarkeit_webshop = Column(Boolean, nullable=False, default=True)
    etiketten_druck = Column(Boolean, nullable=False, default=False)
    mhd_kennzeichnung = Column(Boolean, nullable=False, default=False)
    
    # Preise - empfohlene Preise
    empfohlener_vk = Column(Float, nullable=True)
    einkaufspreis = Column(Float, nullable=True)
    kalkulatorischer_ek = Column(Float, nullable=True)
    
    # Rabatte
    rabatt_gruppe = Column(String(50), nullable=True)
    konditionen = Column(String(100), nullable=True)
    
    # Analysen
    umsatz_trend = Column(String(50), nullable=True)
    durchschnittlicher_absatz = Column(Float, nullable=True)
    
    # Gefahrgut
    gefahrgut_klasse = Column(String(50), nullable=True)
    gefahrgut_nummer = Column(String(50), nullable=True)
    gefahrgut_beschreibung = Column(Text, nullable=True)
    
    # Einstellungen
    ruecknahme_erlaubt = Column(Boolean, nullable=False, default=False)
    mhd_pflicht = Column(Boolean, nullable=False, default=False)
    toleranz_menge = Column(Float, nullable=True)
    kasse_sonderbehandlung = Column(String(100), nullable=True)
    commission = Column(Boolean, nullable=False, default=False)
    etikett_info = Column(String(255), nullable=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    erstellt_von = Column(Integer, ForeignKey("user.id"), nullable=True)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    geaendert_von = Column(Integer, ForeignKey("user.id"), nullable=True)
    
    # Beziehungen
    artikel = relationship("Artikel", foreign_keys=[artikel_id], backref="stammdaten")
    haupt_artikel = relationship("Artikel", foreign_keys=[haupt_artikel_id])
    alternativ_artikel = relationship("AlternativArtikel", back_populates="stammdaten", cascade="all, delete-orphan")
    alternative_einheiten = relationship("AlternativeEinheit", back_populates="stammdaten", cascade="all, delete-orphan")
    verkaufspreise = relationship("VerkaufsPreis", back_populates="stammdaten", cascade="all, delete-orphan")
    dokumente = relationship("ArtikelDokument", back_populates="stammdaten", cascade="all, delete-orphan")
    unterlagen = relationship("ArtikelUnterlage", back_populates="stammdaten", cascade="all, delete-orphan")
    lagerbestaende = relationship("ArtikelLagerbestand", back_populates="stammdaten", cascade="all, delete-orphan")
    artikel_konten = relationship("ArtikelKonto", back_populates="stammdaten", cascade="all, delete-orphan")
    ki_erweiterungen = relationship("KIErweiterung", back_populates="stammdaten", uselist=False, cascade="all, delete-orphan")


class AlternativArtikel(Base):
    """Modell für alternative Artikel"""
    __tablename__ = "alternativ_artikel"
    
    id = Column(Integer, primary_key=True, index=True)
    stammdaten_id = Column(Integer, ForeignKey("artikel_stammdaten.id"), nullable=False)
    alternativ_artikel_id = Column(Integer, ForeignKey("artikel.id"), nullable=False)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    
    # Beziehungen
    stammdaten = relationship("ArtikelStammdaten", back_populates="alternativ_artikel")
    alternativ_artikel = relationship("Artikel")


class AlternativeEinheit(Base):
    """Modell für alternative Einheiten"""
    __tablename__ = "alternative_einheit"
    
    id = Column(Integer, primary_key=True, index=True)
    stammdaten_id = Column(Integer, ForeignKey("artikel_stammdaten.id"), nullable=False)
    einheit = Column(String(50), nullable=False)
    umrechnung = Column(Float, nullable=False)
    einheit_runden = Column(Integer, nullable=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    
    # Beziehungen
    stammdaten = relationship("ArtikelStammdaten", back_populates="alternative_einheiten")


class VerkaufsPreis(Base):
    """Modell für Verkaufspreise"""
    __tablename__ = "verkaufspreis"
    
    id = Column(Integer, primary_key=True, index=True)
    stammdaten_id = Column(Integer, ForeignKey("artikel_stammdaten.id"), nullable=False)
    tabellen_bezeichnung = Column(String(100), nullable=False)
    gueltig_von = Column(Date, nullable=True)
    gueltig_bis = Column(Date, nullable=True)
    basis_preiseinheit = Column(String(50), nullable=True)
    preis_ab_menge = Column(Float, nullable=True)
    brutto = Column(Float, nullable=True)
    netto = Column(Float, nullable=True)
    mwst = Column(Float, nullable=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    stammdaten = relationship("ArtikelStammdaten", back_populates="verkaufspreise")


class ArtikelDokument(Base):
    """Modell für Artikel-Dokumente"""
    __tablename__ = "artikel_dokument"
    
    id = Column(Integer, primary_key=True, index=True)
    stammdaten_id = Column(Integer, ForeignKey("artikel_stammdaten.id"), nullable=False)
    dateiname = Column(String(255), nullable=False)
    dateityp = Column(String(50), nullable=True)
    ablage_kategorie = Column(String(100), nullable=True)
    gueltig_ab = Column(Date, nullable=True)
    gueltig_bis = Column(Date, nullable=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    
    # Beziehungen
    stammdaten = relationship("ArtikelStammdaten", back_populates="dokumente")


class ArtikelUnterlage(Base):
    """Modell für Artikel-Unterlagen"""
    __tablename__ = "artikel_unterlage"
    
    id = Column(Integer, primary_key=True, index=True)
    stammdaten_id = Column(Integer, ForeignKey("artikel_stammdaten.id"), nullable=False)
    bezeichnung = Column(String(255), nullable=False)
    angelegt_am = Column(Date, nullable=True)
    gueltig_ab = Column(Date, nullable=True)
    gueltig_bis = Column(Date, nullable=True)
    bediener = Column(String(100), nullable=True)
    anzahl_seiten = Column(Integer, nullable=True)
    kategorie = Column(String(100), nullable=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    
    # Beziehungen
    stammdaten = relationship("ArtikelStammdaten", back_populates="unterlagen")


class ArtikelKonto(Base):
    """Modell für Artikel-Konten"""
    __tablename__ = "artikel_konto"
    
    id = Column(Integer, primary_key=True, index=True)
    stammdaten_id = Column(Integer, ForeignKey("artikel_stammdaten.id"), nullable=False)
    beginn_datum = Column(Date, nullable=True)
    buchungsdatum = Column(Date, nullable=True)
    verkaeufe = Column(Float, nullable=True, default=0.0)
    einkaeufe = Column(Float, nullable=True, default=0.0)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    
    # Beziehungen
    stammdaten = relationship("ArtikelStammdaten", back_populates="artikel_konten")


class ArtikelLagerbestand(Base):
    """Modell für Artikel-Lagerbestände"""
    __tablename__ = "artikel_lagerbestand"
    
    id = Column(Integer, primary_key=True, index=True)
    stammdaten_id = Column(Integer, ForeignKey("artikel_stammdaten.id"), nullable=False)
    lagerort = Column(String(100), nullable=False)
    buch_bestand = Column(Float, nullable=True, default=0.0)
    lager_bewertung = Column(Float, nullable=True, default=0.0)
    letzte_bewegung = Column(Date, nullable=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    stammdaten = relationship("ArtikelStammdaten", back_populates="lagerbestaende")


class KIErweiterung(Base):
    """KI-Erweiterungen für Artikel-Stammdaten"""
    __tablename__ = "ki_erweiterung"
    
    id = Column(Integer, primary_key=True, index=True)
    stammdaten_id = Column(Integer, ForeignKey("artikel_stammdaten.id"), nullable=False, unique=True)
    
    # Klassifikation
    warengruppe_erkennung_ki = Column(Boolean, nullable=False, default=False)
    klassifikation_confidence = Column(Float, nullable=True)
    
    # Empfehlungen
    preis_vk_automatisch = Column(Float, nullable=True)
    preis_ek_automatisch = Column(Float, nullable=True)
    nachbestellung_prognose = Column(Float, nullable=True)
    
    # Texte
    beschreibung_gpt = Column(Text, nullable=True)
    langtext_gpt = Column(Text, nullable=True)
    
    # Intelligenz-Flags
    auto_preis_update = Column(Boolean, nullable=False, default=False)
    auto_lagerauffuellung = Column(Boolean, nullable=False, default=False)
    auto_kundengruppenrabatt = Column(Boolean, nullable=False, default=False)
    
    # Qualitäts-Check
    anomalie_erkannt = Column(Boolean, nullable=False, default=False)
    letzter_check = Column(Date, nullable=True)
    geprueft_von = Column(String(100), nullable=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    stammdaten = relationship("ArtikelStammdaten", back_populates="ki_erweiterungen")
    alternativen = relationship("KIAlternative", back_populates="ki_erweiterung", cascade="all, delete-orphan")
    seo_keywords = relationship("SEOKeyword", back_populates="ki_erweiterung", cascade="all, delete-orphan")


class KIAlternative(Base):
    """Modell für KI-vorgeschlagene Alternativen"""
    __tablename__ = "ki_alternative"
    
    id = Column(Integer, primary_key=True, index=True)
    ki_erweiterung_id = Column(Integer, ForeignKey("ki_erweiterung.id"), nullable=False)
    artikel_id = Column(Integer, ForeignKey("artikel.id"), nullable=False)
    relevanz_score = Column(Float, nullable=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    
    # Beziehungen
    ki_erweiterung = relationship("KIErweiterung", back_populates="alternativen")
    artikel = relationship("Artikel")


class SEOKeyword(Base):
    """Modell für SEO-Keywords"""
    __tablename__ = "seo_keyword"
    
    id = Column(Integer, primary_key=True, index=True)
    ki_erweiterung_id = Column(Integer, ForeignKey("ki_erweiterung.id"), nullable=False)
    keyword = Column(String(100), nullable=False)
    relevanz = Column(Float, nullable=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    
    # Beziehungen
    ki_erweiterung = relationship("KIErweiterung", back_populates="seo_keywords") 