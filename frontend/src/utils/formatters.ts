/**
 * Utility-Funktionen zur Formatierung von Werten
 */

/**
 * Formatiert einen Währungsbetrag mit dem entsprechenden Währungssymbol
 * @param value Der zu formatierende Betrag
 * @param currency Die Währung (ISO-Code, z.B. 'EUR', 'USD')
 * @param locale Die zu verwendende Locale (Standard: 'de-DE')
 * @returns Formatierter Währungsbetrag als String
 */
export const formatCurrency = (
  value: number, 
  currency: string = 'EUR', 
  locale: string = 'de-DE'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Formatiert ein Datum entsprechend der angegebenen Locale
 * @param date Das zu formatierende Datum
 * @param locale Die zu verwendende Locale (Standard: 'de-DE')
 * @returns Formatiertes Datum als String
 */
export const formatDate = (
  date: Date | string, 
  locale: string = 'de-DE'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale);
};

/**
 * Formatiert einen Prozentwert
 * @param value Der zu formatierende Wert (0.1 für 10%)
 * @param locale Die zu verwendende Locale (Standard: 'de-DE')
 * @returns Formatierter Prozentwert als String
 */
export const formatPercent = (
  value: number, 
  locale: string = 'de-DE'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Formatiert eine Kontonummer mit führenden Nullen
 * @param accountNumber Die zu formatierende Kontonummer
 * @param length Die Zielgesamtlänge der Kontonummer (Standard: 4)
 * @returns Formatierte Kontonummer als String
 */
export const formatAccountNumber = (
  accountNumber: string | number, 
  length: number = 4
): string => {
  const strValue = accountNumber.toString();
  return strValue.padStart(length, '0');
};

/**
 * Formatiert einen Wert in einem einheitlichen Format für das Sortieren
 * @param value Der zu formatierende Wert
 * @returns Formatierter Wert als String
 */
export const formatForSorting = (value: any): string => {
  if (value == null) return '';
  
  if (typeof value === 'number') {
    return value.toString().padStart(20, '0');
  }
  
  if (value instanceof Date) {
    return value.toISOString();
  }
  
  return String(value).toLowerCase();
}; 