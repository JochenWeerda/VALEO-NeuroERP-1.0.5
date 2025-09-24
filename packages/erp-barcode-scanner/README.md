# @valeo/erp-barcode-scanner

Wiederverwendbares ERP-Frontend-Modul für Barcode-Scanning mit QuaggaJS (React + TypeScript).

## Installation

```bash
# im Monorepo
cd packages/erp-barcode-scanner
npm install
npm run build
```

Optional: Quagga2 (bevorzugt) wird automatisch per Dynamic Import geladen, Fallback auf `quagga`.

```bash
npm install @ericblade/quagga2
# oder
npm install quagga
```

## Verwendung

```tsx
import React from 'react';
import { BarcodeScanner, useErpLookup, DetectedBarcode } from '@valeo/erp-barcode-scanner';

export const Example: React.FC = () => {
  const { lookupBarcode } = useErpLookup({ baseUrl: 'mock' });

  const onDetected = async (b: DetectedBarcode) => {
    const item = await lookupBarcode(b.code);
    console.log('Detected', b, 'ERP Item', item);
  };

  return (
    <BarcodeScanner onDetected={onDetected} />
  );
};
```

## Props
- `symbologies`: `('ean_reader' | 'code_128_reader')[]` – Default beide
- `confidenceThreshold`: 0..1 – Default 0.5
- `debounceMs`: Default 600ms
- `autostart`: Default true
- `constraints`: `MediaTrackConstraints` (z. B. min 640x480)
- `overlay`: Bounding-Box/Line Overlay (Default true)

## Hook `useErpLookup`
```ts
const { lookupBarcode } = useErpLookup({ baseUrl: 'https://api.example.com', token: '...' });
const item = await lookupBarcode('4006381333931');
```

- Timeout: 5s (konfigurierbar)
- Retries: 2 (konfigurierbar)
- Fehlerklassen: `TimeoutError`, `ApiError`, `NotFoundError`

