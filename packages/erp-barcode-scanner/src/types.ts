export type DetectedBarcode = {
  code: string;
  format: 'EAN-13' | 'CODE-128' | string;
  confidence: number;
  raw?: unknown;
};

export type ErpItem = {
  id: string;
  sku: string;
  name: string;
  uom?: string;
  price?: number;
  stock?: number;
  meta?: Record<string, unknown>;
};
