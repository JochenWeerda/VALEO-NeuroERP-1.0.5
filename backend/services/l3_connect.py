"""
L3-Connect API Integration für das AI-gesteuerte ERP-System.
Diese Komponente ermöglicht die Kommunikation mit ServiceERP L3 über die L3-Connect API.
"""

import os
import json
import requests
from typing import Dict, Any, Optional, List, Union
from datetime import datetime

class L3ConnectClient:
    """Client für die L3-Connect API Integration."""
    
    def __init__(self, base_url: str = "https://api.service-erp.de", token: str = None, mandant: str = "1"):
        """
        Initialisiert den L3-Connect Client.
        
        Args:
            base_url: Die Basis-URL für die L3-Connect API
            token: Der API-Token für die Authentifizierung
            mandant: Die Mandanten-ID
        """
        self.base_url = base_url
        self.token = token or os.environ.get("L3_CONNECT_TOKEN", "")
        self.mandant = mandant
        self.default_headers = {
            "Authorization": f"Bearer {self.token}",
            "X-l3c-Mandant": self.mandant,
            "X-Customer-Id": "",
            "Content-Type": "application/json"
        }
    
    def _build_url(self, service: str, endpoint: str) -> str:
        """Erstellt die vollständige URL für einen API-Endpunkt."""
        return f"{self.base_url}/service/{service}/api/v1/{endpoint}"
    
    def _handle_response(self, response: requests.Response) -> Dict[str, Any]:
        """Verarbeitet die API-Antwort und wandelt sie in ein Dictionary um."""
        if response.status_code >= 400:
            raise Exception(f"API-Fehler: {response.status_code} - {response.text}")
        
        if not response.text:
            return {"status": "success"}
            
        return response.json()
    
    # Adresse API
    def get_adressen(self, filter_query: str = None) -> List[Dict[str, Any]]:
        """
        Ruft Adressen aus L3 ab.
        
        Args:
            filter_query: Optionaler Filterausdruck, z.B. "Nummer eq 3"
            
        Returns:
            Liste der gefundenen Adressen
        """
        url = self._build_url("adresse", "Adresse")
        if filter_query:
            url += f"?$filter={filter_query}"
        
        response = requests.get(url, headers=self.default_headers)
        result = self._handle_response(response)
        
        return result.get("Data", [])
    
    def get_adresse_by_nummer(self, nummer: int) -> Optional[Dict[str, Any]]:
        """
        Ruft eine Adresse anhand ihrer Nummer ab.
        
        Args:
            nummer: Die Adressnummer
            
        Returns:
            Die gefundene Adresse oder None
        """
        adressen = self.get_adressen(f"Nummer eq {nummer}")
        return adressen[0] if adressen else None
    
    def create_kunde_adresse(self, kundennr: int, adresse_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Erstellt eine neue Adresse für einen Kunden.
        
        Args:
            kundennr: Die Kundennummer
            adresse_data: Die Adressdaten
            
        Returns:
            Das Ergebnis der API-Anfrage
        """
        url = self._build_url("adresse", f"Adresse/kunde/{kundennr}")
        headers = self.default_headers.copy()
        headers["X-Filiale"] = "0"
        
        response = requests.post(url, headers=headers, json=adresse_data)
        return self._handle_response(response)
    
    def update_adresse(self, nummer: int, adresse_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Aktualisiert eine bestehende Adresse.
        
        Args:
            nummer: Die Adressnummer
            adresse_data: Die aktualisierten Adressdaten
            
        Returns:
            Das Ergebnis der API-Anfrage
        """
        url = self._build_url("adresse", f"Adresse/{nummer}")
        
        response = requests.put(url, headers=self.default_headers, json=adresse_data)
        return self._handle_response(response)
    
    def delete_adresse(self, nummer: int) -> Dict[str, Any]:
        """
        Löscht eine Adresse.
        
        Args:
            nummer: Die Adressnummer
            
        Returns:
            Das Ergebnis der API-Anfrage
        """
        url = self._build_url("adresse", f"Adresse/{nummer}")
        
        response = requests.delete(url, headers=self.default_headers)
        return self._handle_response(response)
    
    # Artikel API
    def get_artikel(self, filter_query: str = None) -> List[Dict[str, Any]]:
        """
        Ruft Artikel aus L3 ab.
        
        Args:
            filter_query: Optionaler Filterausdruck
            
        Returns:
            Liste der gefundenen Artikel
        """
        url = self._build_url("artikel", "Artikel")
        if filter_query:
            url += f"?$filter={filter_query}"
        
        response = requests.get(url, headers=self.default_headers)
        result = self._handle_response(response)
        
        return result.get("Data", [])
    
    def get_artikel_by_nummer(self, nummer: str) -> Optional[Dict[str, Any]]:
        """
        Ruft einen Artikel anhand seiner Nummer ab.
        
        Args:
            nummer: Die Artikelnummer
            
        Returns:
            Der gefundene Artikel oder None
        """
        artikel = self.get_artikel(f"Nummer eq '{nummer}'")
        return artikel[0] if artikel else None
    
    # Auftrag API
    def get_auftraege(self, filter_query: str = None) -> List[Dict[str, Any]]:
        """
        Ruft Aufträge aus L3 ab.
        
        Args:
            filter_query: Optionaler Filterausdruck
            
        Returns:
            Liste der gefundenen Aufträge
        """
        url = self._build_url("auftrag", "Auftrag")
        if filter_query:
            url += f"?$filter={filter_query}"
        
        response = requests.get(url, headers=self.default_headers)
        result = self._handle_response(response)
        
        return result.get("Data", [])
    
    def get_auftrag_by_nummer(self, nummer: str) -> Optional[Dict[str, Any]]:
        """
        Ruft einen Auftrag anhand seiner Nummer ab.
        
        Args:
            nummer: Die Auftragsnummer
            
        Returns:
            Der gefundene Auftrag oder None
        """
        auftraege = self.get_auftraege(f"Nummer eq '{nummer}'")
        return auftraege[0] if auftraege else None
    
    # Inventur API
    def get_inventuren(self, filter_query: str = None) -> List[Dict[str, Any]]:
        """
        Ruft Inventuren aus L3 ab.
        
        Args:
            filter_query: Optionaler Filterausdruck
            
        Returns:
            Liste der gefundenen Inventuren
        """
        url = self._build_url("inventur", "Inventur")
        if filter_query:
            url += f"?$filter={filter_query}"
        
        response = requests.get(url, headers=self.default_headers)
        result = self._handle_response(response)
        
        return result.get("Data", [])
    
    # Kunde API
    def get_kunden(self, filter_query: str = None) -> List[Dict[str, Any]]:
        """
        Ruft Kunden aus L3 ab.
        
        Args:
            filter_query: Optionaler Filterausdruck
            
        Returns:
            Liste der gefundenen Kunden
        """
        url = self._build_url("kunde", "Kunde")
        if filter_query:
            url += f"?$filter={filter_query}"
        
        response = requests.get(url, headers=self.default_headers)
        result = self._handle_response(response)
        
        return result.get("Data", [])
    
    def get_kunde_by_nummer(self, nummer: int) -> Optional[Dict[str, Any]]:
        """
        Ruft einen Kunden anhand seiner Nummer ab.
        
        Args:
            nummer: Die Kundennummer
            
        Returns:
            Der gefundene Kunde oder None
        """
        kunden = self.get_kunden(f"Nummer eq {nummer}")
        return kunden[0] if kunden else None
    
    # Lager API
    def get_lager(self, filter_query: str = None) -> List[Dict[str, Any]]:
        """
        Ruft Lager aus L3 ab.
        
        Args:
            filter_query: Optionaler Filterausdruck
            
        Returns:
            Liste der gefundenen Lager
        """
        url = self._build_url("lager", "Lager")
        if filter_query:
            url += f"?$filter={filter_query}"
        
        response = requests.get(url, headers=self.default_headers)
        result = self._handle_response(response)
        
        return result.get("Data", [])
    
    # Dokumenten API (DMS)
    def get_dokumente(self, filter_query: str = None) -> List[Dict[str, Any]]:
        """
        Ruft Dokumente aus dem L3 DMS ab.
        
        Args:
            filter_query: Optionaler Filterausdruck
            
        Returns:
            Liste der gefundenen Dokumente
        """
        url = self._build_url("dms", "Dokument")
        if filter_query:
            url += f"?$filter={filter_query}"
        
        response = requests.get(url, headers=self.default_headers)
        result = self._handle_response(response)
        
        return result.get("Data", [])


# Beispiel für die Verwendung der L3-Connect API
if __name__ == "__main__":
    # Beispiel-Token (muss in der Produktionsumgebung ersetzt werden)
    demo_token = "ihr-api-token-hier"
    
    # Client initialisieren
    client = L3ConnectClient(token=demo_token)
    
    # Beispiel: Adressen abrufen
    adressen = client.get_adressen("Nummer eq 3")
    print(f"Gefundene Adressen: {len(adressen)}")
    
    if adressen:
        print(f"Erste Adresse: {adressen[0]['Name1']}, {adressen[0]['Ort']}") 