/**
 * Utility-Funktionen für die Formatierung von Daten
 * Verwendet für E-Invoicing, POS-System und andere Komponenten
 */

/**
 * Formatiert einen Betrag als Währung
 * @param amount - Der zu formatierende Betrag
 * @param currency - Die Währung (Standard: EUR)
 * @param locale - Das Locale (Standard: de-DE)
 * @returns Formatierter Währungsstring
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'EUR',
  locale: string = 'de-DE'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Formatiert ein Datum
 * @param date - Das zu formatierende Datum
 * @param locale - Das Locale (Standard: de-DE)
 * @param options - Zusätzliche Formatierungsoptionen
 * @returns Formatierter Datumsstring
 */
export const formatDate = (
  date: Date | string | number,
  locale: string = 'de-DE',
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };

  return new Intl.DateTimeFormat(locale, {
    ...defaultOptions,
    ...options
  }).format(dateObj);
};

/**
 * Formatiert ein Datum mit Uhrzeit
 * @param date - Das zu formatierende Datum
 * @param locale - Das Locale (Standard: de-DE)
 * @returns Formatierter Datum-Uhrzeit-String
 */
export const formatDateTime = (
  date: Date | string | number,
  locale: string = 'de-DE'
): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(dateObj);
};

/**
 * Formatiert eine Telefonnummer
 * @param phone - Die zu formatierende Telefonnummer
 * @returns Formatierte Telefonnummer
 */
export const formatPhone = (phone: string): string => {
  // Entferne alle nicht-numerischen Zeichen
  const cleaned = phone.replace(/\D/g, '');
  
  // Deutsche Telefonnummer-Formatierung
  if (cleaned.length === 11 && cleaned.startsWith('49')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
  }
  
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
  }
  
  return phone;
};

/**
 * Formatiert eine Steuernummer
 * @param taxNumber - Die zu formatierende Steuernummer
 * @returns Formatierte Steuernummer
 */
export const formatTaxNumber = (taxNumber: string): string => {
  const cleaned = taxNumber.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}/${cleaned.slice(3, 6)}/${cleaned.slice(6, 9)}/${cleaned.slice(9)}`;
  }
  
  return taxNumber;
};

/**
 * Formatiert eine IBAN
 * @param iban - Die zu formatierende IBAN
 * @returns Formatierte IBAN
 */
export const formatIBAN = (iban: string): string => {
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  
  if (cleaned.length === 22) {
    return cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
  }
  
  return iban;
};

/**
 * Formatiert eine Zahl mit Tausendertrennzeichen
 * @param number - Die zu formatierende Zahl
 * @param locale - Das Locale (Standard: de-DE)
 * @returns Formatierte Zahl
 */
export const formatNumber = (
  number: number,
  locale: string = 'de-DE'
): string => {
  return new Intl.NumberFormat(locale).format(number);
};

/**
 * Formatiert eine Prozentangabe
 * @param value - Der Prozentwert (0-1)
 * @param locale - Das Locale (Standard: de-DE)
 * @returns Formatierte Prozentangabe
 */
export const formatPercentage = (
  value: number,
  locale: string = 'de-DE'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Formatiert eine Dateigröße
 * @param bytes - Größe in Bytes
 * @returns Formatierte Dateigröße
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Formatiert eine Uhrzeit
 * @param date - Das Datum mit Uhrzeit
 * @param locale - Das Locale (Standard: de-DE)
 * @returns Formatierte Uhrzeit
 */
export const formatTime = (
  date: Date | string | number,
  locale: string = 'de-DE'
): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
}; 