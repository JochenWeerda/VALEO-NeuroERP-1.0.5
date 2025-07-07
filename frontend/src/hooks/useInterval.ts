import { useEffect, useRef } from 'react';

/**
 * Custom Hook für periodische Aktualisierungen
 * @param callback Funktion die periodisch ausgeführt werden soll
 * @param delay Verzögerung in Millisekunden (null zum Deaktivieren)
 */
export function useInterval(callback: () => void, delay: number | null) {
    const savedCallback = useRef<() => void>();

    // Callback speichern
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Intervall einrichten
    useEffect(() => {
        function tick() {
            savedCallback.current?.();
        }

        if (delay !== null) {
            const id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
} 