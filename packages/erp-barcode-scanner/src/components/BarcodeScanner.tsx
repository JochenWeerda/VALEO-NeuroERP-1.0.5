import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DetectedBarcode } from '../types';

export type Symbology = 'ean_reader' | 'code_128_reader';

export interface BarcodeScannerProps {
  onDetected?: (payload: DetectedBarcode) => void;
  onError?: (err: Error) => void;
  symbologies?: Symbology[];
  confidenceThreshold?: number; // 0..1
  debounceMs?: number;
  autostart?: boolean;
  constraints?: MediaTrackConstraints;
  overlay?: boolean;
  className?: string;
}

const DEFAULT_CONSTRAINTS: MediaTrackConstraints = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
  facingMode: { ideal: 'environment' as any }
};

const DEFAULT_SYMBOLOGIES: Symbology[] = ['ean_reader', 'code_128_reader'];

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onDetected,
  onError,
  symbologies = DEFAULT_SYMBOLOGIES,
  confidenceThreshold = 0.5,
  debounceMs = 600,
  autostart = true,
  constraints,
  overlay = true,
  className
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const quaggaRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastShotRef = useRef<{ code: string; at: number } | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<'ready' | 'scanning' | 'paused' | 'no-access' | 'error'>('ready');
  const [quaggaAvailable, setQuaggaAvailable] = useState<boolean>(false);

  const effectiveConstraints = useMemo<MediaTrackConstraints>(() => ({
    ...DEFAULT_CONSTRAINTS,
    ...(constraints || {}),
    ...(deviceId ? { deviceId: { exact: deviceId } } : {})
  }), [constraints, deviceId]);

  // Dynamic import quagga2 -> fallback to quagga (vite-ignore to avoid dep-scan resolution)
  const loadQuagga = useCallback(async (): Promise<any | null> => {
    try {
      const name = '@ericblade/quagga2';
      // @ts-ignore
      const mod = await import(/* @vite-ignore */ name);
      return mod.default || (mod as any);
    } catch {
      try {
        const name2 = 'quagga';
        // @ts-ignore
        const mod2 = await import(/* @vite-ignore */ name2);
        return (mod2 as any).default || (mod2 as any);
      } catch {
        return null;
      }
    }
  }, []);

  const stopStreams = useCallback(() => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => {
          try { t.stop(); } catch {}
        });
      }
    } finally {
      streamRef.current = null;
    }
  }, []);

  const cleanup = useCallback(async () => {
    try {
      if (quaggaRef.current && quaggaAvailable) {
        try { quaggaRef.current.offDetected?.(); } catch {}
        try { quaggaRef.current.stop?.(); } catch {}
      }
    } finally {
      quaggaRef.current = null;
      stopStreams();
      setStatus('ready');
    }
  }, [quaggaAvailable, stopStreams]);

  const enumerateCameras = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const devs = await navigator.mediaDevices.enumerateDevices();
      const cams = devs.filter(d => d.kind === 'videoinput');
      setDevices(cams);
      if (!deviceId && cams.length > 0) {
        // prefer back camera
        const env = cams.find(d => /back|rear|environment/i.test(d.label));
        setDeviceId(env?.deviceId || cams[0].deviceId);
      }
    } catch (e) {
      // ignore
    }
  }, [deviceId]);

  const drawOverlay = useCallback((result: any) => {
    if (!overlay || !overlayCanvasRef.current) return;
    const canvas = overlayCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!result) return;

    const drawPath = (path: Array<[number, number]>, color: string) => {
      if (!path || path.length === 0) return;
      ctx.beginPath();
      ctx.moveTo(path[0][0], path[0][1]);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i][0], path[i][1]);
      }
      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
      ctx.stroke();
    };

    if (result.box) {
      drawPath(result.box, '#00E676');
    }
    if (Array.isArray(result.boxes)) {
      result.boxes.forEach((box: any) => drawPath(box, 'rgba(255,255,255,0.25)'));
    }
    if (result.codeResult?.code) {
      const code = result.codeResult.code as string;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, canvas.width, 28);
      ctx.fillStyle = '#fff';
      ctx.font = '16px system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';
      ctx.fillText(code, 8, 20);
    }
  }, [overlay]);

  const computeConfidence = (result: any): number => {
    const decoded = result?.codeResult?.decodedCodes as Array<{ error?: number }> | undefined;
    if (decoded && decoded.length) {
      const errors = decoded.filter(x => typeof x.error === 'number').map(x => Math.abs(x.error || 0));
      if (errors.length) {
        // heuristic: lower error -> higher confidence
        const avgErr = errors.reduce((a, b) => a + b, 0) / errors.length;
        const conf = Math.max(0, Math.min(1, 1 - avgErr));
        return conf;
      }
    }
    return 0.9; // fallback optimistic
  };

  const start = useCallback(async () => {
    if (!containerRef.current) return;
    setStatus('ready');
    const Q = await loadQuagga();
    if (!Q) {
      setQuaggaAvailable(false);
      setStatus('error');
      onError?.(new Error('Quagga nicht verfügbar'));
      return;
    }
    setQuaggaAvailable(true);

    try {
      // Prepare overlay canvas size to match container
      const container = containerRef.current;
      const canvas = overlayCanvasRef.current;
      if (canvas) {
        const rect = container.getBoundingClientRect();
        canvas.width = Math.floor(rect.width);
        canvas.height = Math.floor(rect.height);
      }

      await cleanup();

      await new Promise<void>((resolve, reject) => {
        Q.init({
          inputStream: {
            type: 'LiveStream',
            constraints: effectiveConstraints,
            target: container
          },
          locator: { patchSize: 'medium', halfSample: true },
          numOfWorkers: navigator.hardwareConcurrency ? Math.max(1, Math.min(4, navigator.hardwareConcurrency - 1)) : 2,
          frequency: 10,
          decoder: { readers: symbologies }
        }, (err: any) => {
          if (err) return reject(err);
          try { Q.start(); } catch {}
          resolve();
        });
      });

      quaggaRef.current = Q;
      setStatus('scanning');

      Q.onProcessed((res: any) => drawOverlay(res));

      Q.onDetected((result: any) => {
        const code = result?.codeResult?.code as string | undefined;
        const formatRaw = result?.codeResult?.format as string | undefined;
        if (!code) return;
        const now = Date.now();
        const conf = computeConfidence(result);
        if (conf < confidenceThreshold) return;
        if (lastShotRef.current && lastShotRef.current.code === code && now - lastShotRef.current.at < debounceMs) {
          return;
        }
        lastShotRef.current = { code, at: now };
        const payload: DetectedBarcode = {
          code,
          format: /^ean/i.test(formatRaw || '') ? 'EAN-13' : (/code_128/i.test(formatRaw || '') ? 'CODE-128' : (formatRaw || 'unknown')),
          confidence: conf,
          raw: result
        };
        onDetected?.(payload);
      });
    } catch (e) {
      setStatus('error');
      onError?.(e instanceof Error ? e : new Error(String(e)));
    }
  }, [cleanup, computeConfidence, confidenceThreshold, debounceMs, drawOverlay, effectiveConstraints, loadQuagga, onDetected, onError, symbologies]);

  const stop = useCallback(async () => {
    await cleanup();
    setStatus('paused');
  }, [cleanup]);

  const handleFile = useCallback(async (file: File) => {
    const Q = quaggaRef.current || (await loadQuagga());
    if (!Q) {
      onError?.(new Error('Quagga nicht verfügbar'));
      return;
    }
    const src = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.readAsDataURL(file);
    });
    return new Promise<void>((resolve) => {
      Q.decodeSingle({
        src,
        numOfWorkers: 0,
        decoder: { readers: symbologies },
        locate: true
      }, (result: any) => {
        if (result && result.codeResult && result.codeResult.code) {
          const conf = computeConfidence(result);
          if (conf >= confidenceThreshold) {
            const payload: DetectedBarcode = {
              code: result.codeResult.code,
              format: /^ean/i.test(result.codeResult.format || '') ? 'EAN-13' : (/code_128/i.test(result.codeResult.format || '') ? 'CODE-128' : (result.codeResult.format || 'unknown')),
              confidence: conf,
              raw: result
            };
            onDetected?.(payload);
          }
        }
        resolve();
      });
    });
  }, [computeConfidence, confidenceThreshold, loadQuagga, onDetected, symbologies, onError]);

  useEffect(() => {
    enumerateCameras();
  }, [enumerateCameras]);

  useEffect(() => {
    if (autostart) start();
    return () => { cleanup(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autostart, deviceId, JSON.stringify(effectiveConstraints), JSON.stringify(symbologies)]);

  const onChangeDevice = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDeviceId(e.target.value);
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-2">
        <select onChange={onChangeDevice} value={deviceId} className="border rounded px-2 py-1">
          {devices.length === 0 && <option value="">Keine Kamera gefunden</option>}
          {devices.map(d => (
            <option key={d.deviceId} value={d.deviceId}>{d.label || `Kamera ${d.deviceId.slice(0,6)}`}</option>
          ))}
        </select>
        <button onClick={start} className="bg-blue-600 text-white rounded px-3 py-1">Start</button>
        <button onClick={stop} className="bg-gray-200 rounded px-3 py-1">Stop</button>
        <label className="ml-auto text-sm text-gray-600">Test aus Datei
          <input type="file" accept="image/*" className="ml-2" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </label>
      </div>
      <div className="relative w-full" style={{ aspectRatio: '16 / 9', background: '#111827', borderRadius: 8 }}>
        <div ref={containerRef} id="scanner-root" className="absolute inset-0" />
        {overlay && <canvas ref={overlayCanvasRef} className="absolute inset-0 pointer-events-none" />}
      </div>
      <div className="mt-2 text-sm text-gray-700" role="status">
        Status: {status === 'ready' ? 'Bereit' : status === 'scanning' ? 'Scanne' : status === 'paused' ? 'Pause' : status === 'no-access' ? 'Kein Zugriff' : 'Fehler'}
      </div>
    </div>
  );
};
