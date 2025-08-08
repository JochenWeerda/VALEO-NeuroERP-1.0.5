import { useState, useEffect } from 'react';

interface UseLocalStorageOptions {
  serialize?: (value: unknown) => string;
  deserialize?: (value: string) => unknown;
}

const defaultOptions: UseLocalStorageOptions = {
  serialize: JSON.stringify,
  deserialize: JSON.parse,
};

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions = {}
): [T, (value: T | ((val: T) => T)) => void] {
  const { serialize, deserialize } = { ...defaultOptions, ...options };

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (deserialize!(item) as T) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, serialize!(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

// Hook for managing multiple localStorage items
export function useLocalStorageMulti<T extends Record<string, unknown>>(
  keys: (keyof T)[],
  initialValues: T
): [T, (updates: Partial<T>) => void] {
  const [values, setValues] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValues;
    }

    const result = { ...initialValues };
    
    keys.forEach((key) => {
      try {
        const item = window.localStorage.getItem(String(key));
        if (item) {
          result[key] = JSON.parse(item) as T[keyof T];
        }
      } catch (error) {
        console.error(`Error reading localStorage key "${String(key)}":`, error);
      }
    });

    return result;
  });

  const setValue = (updates: Partial<T>) => {
    const newValues = { ...values, ...updates };
    setValues(newValues);

    if (typeof window !== 'undefined') {
      Object.entries(updates).forEach(([key, value]) => {
        try {
          window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
          console.error(`Error setting localStorage key "${key}":`, error);
        }
      });
    }
  };

  return [values, setValue];
}

// Hook for managing localStorage with expiration
export function useLocalStorageWithExpiry<T>(
  key: string,
  initialValue: T,
  expiryInMinutes: number = 60
): [T | null, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (!item) return null;

      const parsedItem = JSON.parse(item) as { value: T; expiry: number };
      
      if (Date.now() > parsedItem.expiry) {
        window.localStorage.removeItem(key);
        return null;
      }

      return parsedItem.value;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return null;
    }
  });

  const setValue = (value: T) => {
    try {
      const item = {
        value,
        expiry: Date.now() + (expiryInMinutes * 60 * 1000),
      };

      setStoredValue(value);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(item));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

// Hook for managing localStorage with encryption (basic)
export function useLocalStorageEncrypted<T>(
  key: string,
  initialValue: T,
  password: string
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;

      // Basic encryption/decryption (for production, use a proper encryption library)
      const decrypted = atob(item);
      const parsed = JSON.parse(decrypted) as T;
      return parsed;
    } catch (error) {
      console.error(`Error reading encrypted localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      // Basic encryption (for production, use a proper encryption library)
      const encrypted = btoa(JSON.stringify(value));
      
      setStoredValue(value);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, encrypted);
      }
    } catch (error) {
      console.error(`Error setting encrypted localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

// Hook for managing localStorage with validation
export function useLocalStorageWithValidation<T>(
  key: string,
  initialValue: T,
  validator: (value: unknown) => value is T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;

      const parsed = JSON.parse(item) as unknown;
      
      if (validator(parsed)) {
        return parsed;
      } else {
        console.warn(`Invalid data in localStorage key "${key}", using initial value`);
        return initialValue;
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      if (!validator(value)) {
        throw new Error(`Invalid value for localStorage key "${key}"`);
      }

      setStoredValue(value);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
} 