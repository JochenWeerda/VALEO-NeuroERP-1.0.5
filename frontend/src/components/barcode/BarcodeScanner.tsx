import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, Typography, Button, Alert, Box, CircularProgress } from '@mui/material';
import { CameraAlt as CameraIcon, QrCode as QrCodeIcon } from '@mui/icons-material';
import Quagga from 'quagga';

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
  onError?: (error: string) => void;
  autoStart?: boolean;
  className?: string;
}

interface ScanResult {
  codeResult: {
    code: string;
    format: string;
  };
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onBarcodeDetected,
  onError,
  autoStart = false,
  className = ''
}) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);

  // Barcode-Erkennung Callback
  const onDetected = useCallback((result: ScanResult) => {
    const code = result.codeResult.code;
    if (code && code !== lastScannedCode) {
      setLastScannedCode(code);
      onBarcodeDetected(code);
      
      // Kurze Pause nach erfolgreichem Scan
      setTimeout(() => {
        setLastScannedCode(null);
      }, 2000);
    }
  }, [onBarcodeDetected, lastScannedCode]);

  // Scanner initialisieren
  const initializeScanner = useCallback(async () => {
    if (!scannerRef.current) return;

    try {
      setError(null);
      setIsInitialized(false);

      await Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: scannerRef.current,
          constraints: {
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 },
            facingMode: "environment" // Rückkamera bevorzugen
          },
        },
        locator: {
          patchSize: "medium",
          halfSample: true
        },
        numOfWorkers: navigator.hardwareConcurrency || 4,
        frequency: 10,
        decoder: {
          readers: [
            "ean_reader",
            "ean_8_reader",
            "code_128_reader",
            "code_39_reader",
            "upc_reader",
            "upc_e_reader"
          ]
        },
        locate: true
      });

      Quagga.onDetected(onDetected);
      setIsInitialized(true);
      
      if (autoStart) {
        startScanning();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Scanner-Initialisierung fehlgeschlagen';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [onDetected, autoStart, onError]);

  // Scanner starten
  const startScanning = useCallback(async () => {
    if (!isInitialized) {
      await initializeScanner();
    }
    
    try {
      await Quagga.start();
      setIsScanning(true);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Scanner konnte nicht gestartet werden';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [isInitialized, initializeScanner, onError]);

  // Scanner stoppen
  const stopScanning = useCallback(() => {
    Quagga.stop();
    setIsScanning(false);
  }, []);

  // Komponente aufräumen
  useEffect(() => {
    return () => {
      if (isScanning) {
        Quagga.stop();
      }
    };
  }, [isScanning]);

  // Initialisierung beim Mount
  useEffect(() => {
    if (autoStart) {
      initializeScanner();
    }
  }, [autoStart, initializeScanner]);

  return (
    <Card className={`p-4 ${className}`}>
      <Box className="flex items-center justify-between mb-4">
        <Typography variant="h6" className="flex items-center gap-2">
          <QrCodeIcon />
          Barcode-Scanner
        </Typography>
        
        <Box className="flex gap-2">
          {!isScanning ? (
            <Button
              variant="contained"
              startIcon={<CameraIcon />}
              onClick={startScanning}
              disabled={!isInitialized && !autoStart}
            >
              Scanner starten
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="secondary"
              onClick={stopScanning}
            >
              Scanner stoppen
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      {lastScannedCode && (
        <Alert severity="success" className="mb-4">
          Barcode erkannt: <strong>{lastScannedCode}</strong>
        </Alert>
      )}

      <Box className="relative">
        <div
          ref={scannerRef}
          className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300"
        >
          {!isScanning && (
            <Box className="flex items-center justify-center h-full">
              <Box className="text-center">
                <CameraIcon className="text-4xl text-gray-400 mb-2" />
                <Typography variant="body2" color="textSecondary">
                  Scanner bereit - Klicken Sie auf "Scanner starten"
                </Typography>
              </Box>
            </Box>
          )}
        </div>

        {isScanning && (
          <Box className="absolute inset-0 flex items-center justify-center">
            <CircularProgress size={40} />
          </Box>
        )}
      </Box>

      <Box className="mt-4">
        <Typography variant="body2" color="textSecondary">
          Unterstützte Formate: EAN-13, EAN-8, Code 128, Code 39, UPC
        </Typography>
      </Box>
    </Card>
  );
}; 