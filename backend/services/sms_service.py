import os
import logging
import requests
from typing import Dict, Any, Optional, Tuple
from datetime import datetime

class SMSService:
    """
    SMS-Dienst zur Integration mit verschiedenen SMS-Providern
    Unterstützt: Twilio, Nexmo/Vonage und MessageBird
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        self.logger = logging.getLogger(__name__)
        self.config = config or {}
        self.provider = self.config.get("provider", "twilio").lower()
        
        # Default-Konfiguration
        if not self.config:
            self.config = {
                "provider": "twilio",
                "twilio": {
                    "account_sid": os.environ.get("TWILIO_ACCOUNT_SID", ""),
                    "auth_token": os.environ.get("TWILIO_AUTH_TOKEN", ""),
                    "from_number": os.environ.get("TWILIO_FROM_NUMBER", ""),
                },
                "vonage": {
                    "api_key": os.environ.get("VONAGE_API_KEY", ""),
                    "api_secret": os.environ.get("VONAGE_API_SECRET", ""),
                    "from_number": os.environ.get("VONAGE_FROM_NUMBER", "")
                },
                "messagebird": {
                    "api_key": os.environ.get("MESSAGEBIRD_API_KEY", ""),
                    "from_number": os.environ.get("MESSAGEBIRD_FROM_NUMBER", "")
                }
            }
    
    def send_sms(self, to_number: str, message: str, country_code: str = None) -> Tuple[bool, str]:
        """
        Sendet eine SMS über den konfigurierten Provider
        
        Args:
            to_number: Empfänger-Telefonnummer im internationalen Format (z.B. +49123456789)
            message: SMS-Nachricht
            country_code: Ländercode für die Formatierung der Telefonnummer (z.B. "DE")
            
        Returns:
            Tuple mit (Erfolg, Fehlermeldung oder leerer String)
        """
        try:
            # Stelle sicher, dass die Telefonnummer im internationalen Format ist
            to_number = self._format_phone_number(to_number, country_code)
            
            self.logger.info(f"Sende SMS an {to_number} über {self.provider}")
            
            if self.provider == "twilio":
                return self._send_via_twilio(to_number, message)
            elif self.provider == "vonage":
                return self._send_via_vonage(to_number, message)
            elif self.provider == "messagebird":
                return self._send_via_messagebird(to_number, message)
            else:
                error_msg = f"Unbekannter SMS-Provider: {self.provider}"
                self.logger.error(error_msg)
                return False, error_msg
                
        except Exception as e:
            error_msg = f"Fehler beim Senden der SMS: {str(e)}"
            self.logger.error(error_msg)
            return False, error_msg
    
    def _format_phone_number(self, phone_number: str, country_code: str = None) -> str:
        """Formatiert eine Telefonnummer im internationalen Format"""
        # Entferne alle Nicht-Ziffern
        phone_number = ''.join(filter(str.isdigit, phone_number))
        
        # Wenn die Nummer bereits mit + beginnt, ist sie wahrscheinlich schon im internationalen Format
        if phone_number.startswith('+'):
            return phone_number
        
        # Entferne führende Nullen
        phone_number = phone_number.lstrip('0')
        
        # Füge Ländervorwahl hinzu, wenn nicht vorhanden
        if country_code:
            # Entferne + aus dem Ländercode, falls vorhanden
            country_code = country_code.replace('+', '')
            
            # Wenn der Ländercode DE ist, verwende +49
            if country_code.upper() == 'DE':
                return f"+49{phone_number}"
            else:
                return f"+{country_code}{phone_number}"
        
        # Fallback: Nimm an, dass es eine deutsche Nummer ist
        return f"+49{phone_number}"
    
    def _send_via_twilio(self, to_number: str, message: str) -> Tuple[bool, str]:
        """Sendet eine SMS über Twilio API"""
        try:
            twilio_config = self.config.get("twilio", {})
            account_sid = twilio_config.get("account_sid")
            auth_token = twilio_config.get("auth_token")
            from_number = twilio_config.get("from_number")
            
            if not account_sid or not auth_token or not from_number:
                return False, "Twilio Konfiguration unvollständig"
            
            # Twilio API Endpunkt
            url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
            
            # API-Anfrage senden
            response = requests.post(
                url,
                auth=(account_sid, auth_token),
                data={
                    "From": from_number,
                    "To": to_number,
                    "Body": message
                }
            )
            
            response.raise_for_status()
            response_data = response.json()
            
            # Überprüfe den Status der SMS
            if response_data.get("status") in ["failed", "undelivered"]:
                error_msg = f"Twilio SMS fehlgeschlagen: {response_data.get('error_message', 'Unbekannter Fehler')}"
                self.logger.error(error_msg)
                return False, error_msg
            
            return True, ""
            
        except requests.exceptions.RequestException as e:
            error_msg = f"Twilio API-Fehler: {str(e)}"
            if hasattr(e, 'response') and e.response:
                error_msg += f" - {e.response.text}"
            self.logger.error(error_msg)
            return False, error_msg
    
    def _send_via_vonage(self, to_number: str, message: str) -> Tuple[bool, str]:
        """Sendet eine SMS über Vonage (ehemals Nexmo) API"""
        try:
            vonage_config = self.config.get("vonage", {})
            api_key = vonage_config.get("api_key")
            api_secret = vonage_config.get("api_secret")
            from_number = vonage_config.get("from_number")
            
            if not api_key or not api_secret:
                return False, "Vonage Konfiguration unvollständig"
            
            # Vonage API Endpunkt
            url = "https://rest.nexmo.com/sms/json"
            
            # API-Anfrage senden
            response = requests.post(
                url,
                data={
                    "api_key": api_key,
                    "api_secret": api_secret,
                    "from": from_number or "ERP-System",
                    "to": to_number,
                    "text": message
                }
            )
            
            response.raise_for_status()
            response_data = response.json()
            
            # Überprüfe den Status der SMS
            if response_data.get("messages") and response_data["messages"][0].get("status") != "0":
                error_msg = f"Vonage SMS fehlgeschlagen: {response_data['messages'][0].get('error-text', 'Unbekannter Fehler')}"
                self.logger.error(error_msg)
                return False, error_msg
            
            return True, ""
            
        except requests.exceptions.RequestException as e:
            error_msg = f"Vonage API-Fehler: {str(e)}"
            if hasattr(e, 'response') and e.response:
                error_msg += f" - {e.response.text}"
            self.logger.error(error_msg)
            return False, error_msg
    
    def _send_via_messagebird(self, to_number: str, message: str) -> Tuple[bool, str]:
        """Sendet eine SMS über MessageBird API"""
        try:
            messagebird_config = self.config.get("messagebird", {})
            api_key = messagebird_config.get("api_key")
            from_number = messagebird_config.get("from_number")
            
            if not api_key:
                return False, "MessageBird Konfiguration unvollständig"
            
            # MessageBird API Endpunkt
            url = "https://rest.messagebird.com/messages"
            
            # API-Anfrage senden
            response = requests.post(
                url,
                headers={
                    "Authorization": f"AccessKey {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "originator": from_number or "ERP-System",
                    "recipients": [to_number],
                    "body": message
                }
            )
            
            response.raise_for_status()
            response_data = response.json()
            
            # Überprüfe den Status der SMS
            if response_data.get("errors"):
                error_msgs = [error.get("description", "Unbekannter Fehler") for error in response_data["errors"]]
                error_msg = f"MessageBird SMS fehlgeschlagen: {', '.join(error_msgs)}"
                self.logger.error(error_msg)
                return False, error_msg
            
            return True, ""
            
        except requests.exceptions.RequestException as e:
            error_msg = f"MessageBird API-Fehler: {str(e)}"
            if hasattr(e, 'response') and e.response:
                error_msg += f" - {e.response.text}"
            self.logger.error(error_msg)
            return False, error_msg
    
    def get_delivery_status(self, message_id: str) -> Dict[str, Any]:
        """
        Ruft den Zustellungsstatus einer SMS ab
        
        Args:
            message_id: ID der SMS-Nachricht
            
        Returns:
            Dictionary mit Status-Informationen
        """
        try:
            if self.provider == "twilio":
                return self._get_twilio_delivery_status(message_id)
            elif self.provider == "vonage":
                return self._get_vonage_delivery_status(message_id)
            elif self.provider == "messagebird":
                return self._get_messagebird_delivery_status(message_id)
            else:
                return {"error": f"Unbekannter SMS-Provider: {self.provider}"}
        except Exception as e:
            error_msg = f"Fehler beim Abrufen des Zustellungsstatus: {str(e)}"
            self.logger.error(error_msg)
            return {"error": error_msg}
    
    def _get_twilio_delivery_status(self, message_id: str) -> Dict[str, Any]:
        """Ruft den Zustellungsstatus einer Twilio-SMS ab"""
        try:
            twilio_config = self.config.get("twilio", {})
            account_sid = twilio_config.get("account_sid")
            auth_token = twilio_config.get("auth_token")
            
            if not account_sid or not auth_token:
                return {"error": "Twilio Konfiguration unvollständig"}
            
            url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages/{message_id}.json"
            
            response = requests.get(url, auth=(account_sid, auth_token))
            response.raise_for_status()
            
            return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def _get_vonage_delivery_status(self, message_id: str) -> Dict[str, Any]:
        """Ruft den Zustellungsstatus einer Vonage-SMS ab"""
        # Vonage bietet keinen direkten Weg, den Status einer einzelnen SMS abzurufen
        # Stattdessen würde man Webhooks für Statusupdates verwenden
        return {"error": "Nicht implementiert für Vonage"}
    
    def _get_messagebird_delivery_status(self, message_id: str) -> Dict[str, Any]:
        """Ruft den Zustellungsstatus einer MessageBird-SMS ab"""
        try:
            messagebird_config = self.config.get("messagebird", {})
            api_key = messagebird_config.get("api_key")
            
            if not api_key:
                return {"error": "MessageBird Konfiguration unvollständig"}
            
            url = f"https://rest.messagebird.com/messages/{message_id}"
            
            response = requests.get(
                url,
                headers={"Authorization": f"AccessKey {api_key}"}
            )
            response.raise_for_status()
            
            return response.json()
        except Exception as e:
            return {"error": str(e)} 