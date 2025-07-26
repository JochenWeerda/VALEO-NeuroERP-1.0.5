import { useState, useEffect, useCallback } from 'react';

// LocalStorage Hook für VALEO NeuroERP
interface UseLocalStorageOptions<T> {
  defaultValue: T;
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
}

export const useLocalStorage = <T>(
  key: string,
  options: UseLocalStorageOptions<T>
) => {
  const { defaultValue, serializer = JSON.stringify, deserializer = JSON.parse } = options;

  // Get initial value from localStorage or use default
  const getStoredValue = useCallback((): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? deserializer(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  }, [key, defaultValue, deserializer]);

  const [storedValue, setStoredValue] = useState<T>(getStoredValue);

  // Set value to localStorage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, serializer(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, serializer, storedValue]);

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(defaultValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  // Update stored value when key changes
  useEffect(() => {
    setStoredValue(getStoredValue());
  }, [key, getStoredValue]);

  return [storedValue, setValue, removeValue] as const;
};

// Specialized Hooks für häufige Datentypen
export const useLocalStorageString = (key: string, defaultValue: string = '') => {
  return useLocalStorage(key, {
    defaultValue,
    serializer: (value: string) => value,
    deserializer: (value: string) => value
  });
};

export const useLocalStorageNumber = (key: string, defaultValue: number = 0) => {
  return useLocalStorage(key, {
    defaultValue,
    serializer: (value: number) => value.toString(),
    deserializer: (value: string) => {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    }
  });
};

export const useLocalStorageBoolean = (key: string, defaultValue: boolean = false) => {
  return useLocalStorage(key, {
    defaultValue,
    serializer: (value: boolean) => value.toString(),
    deserializer: (value: string) => value === 'true'
  });
};

export const useLocalStorageArray = <T>(key: string, defaultValue: T[] = []) => {
  return useLocalStorage<T[]>(key, { defaultValue });
};

export const useLocalStorageObject = <T extends Record<string, any>>(key: string, defaultValue: T) => {
  return useLocalStorage<T>(key, { defaultValue });
}; 