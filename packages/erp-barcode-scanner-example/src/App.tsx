import React, { useState } from 'react';
import { BarcodeScanner, DetectedBarcode, useErpLookup, ErpItem } from '@valeo/erp-barcode-scanner';

export const App: React.FC = () => {
  const { lookupBarcode } = useErpLookup({ baseUrl: 'mock' });
  const [last, setLast] = useState<DetectedBarcode | null>(null);
  const [item, setItem] = useState<ErpItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDetected = async (b: DetectedBarcode) => {
    setLast(b);
    setError(null);
    try {
      const res = await lookupBarcode(b.code);
      setItem(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: 16, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif' }}>
      <h1>ERP Barcode Scanner Demo</h1>
      <p>Scanne EAN-13 / Code128, validiere Confidence und löse ERP-Lookup aus.</p>
      <BarcodeScanner onDetected={handleDetected} />
      <div style={{ marginTop: 12 }}>
        {last && (
          <div style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
            <div><strong>Code:</strong> {last.code}</div>
            <div><strong>Format:</strong> {last.format}</div>
            <div><strong>Confidence:</strong> {Math.round(last.confidence * 100)}%</div>
          </div>
        )}
        {item && (
          <div style={{ marginTop: 12, padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
            <div><strong>Artikel:</strong> {item.name} ({item.sku})</div>
            <div><strong>Preis:</strong> {item.price ?? '-'} | <strong>Bestand:</strong> {item.stock ?? '-'}</div>
          </div>
        )}
        {error && (
          <div style={{ marginTop: 12, padding: 12, border: '1px solid #fecaca', background: '#fee2e2', color: '#991b1b', borderRadius: 8 }}>
            Fehler: {error}
          </div>
        )}
      </div>
    </div>
  );
};
