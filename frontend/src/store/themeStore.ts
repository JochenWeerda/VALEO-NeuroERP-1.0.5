import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Theme Types für VALEO NeuroERP
type ThemeMode = 'neural' | 'neural-light' | 'neural-dark';

interface ThemePreferences {
  mode: ThemeMode;
  language: 'de' | 'en';
  compactMode: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

interface ThemeStore {
  // State
  themeMode: ThemeMode;
  preferences: ThemePreferences;
  
  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (language: 'de' | 'en') => void;
  toggleCompactMode: () => void;
  toggleHighContrast: () => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  resetPreferences: () => void;
}

// Default Theme Preferences
const defaultPreferences: ThemePreferences = {
  mode: 'neural',
  language: 'de',
  compactMode: false,
  highContrast: false,
  fontSize: 'medium'
};

export const useThemeStore = create<ThemeStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        themeMode: 'neural',
        preferences: defaultPreferences,
        
        // Actions
        setThemeMode: (mode) => {
          set({ themeMode: mode });
          set((state) => ({
            preferences: { ...state.preferences, mode }
          }));
        },
        
        setLanguage: (language) => {
          set((state) => ({
            preferences: { ...state.preferences, language }
          }));
        },
        
        toggleCompactMode: () => {
          set((state) => ({
            preferences: { 
              ...state.preferences, 
              compactMode: !state.preferences.compactMode 
            }
          }));
        },
        
        toggleHighContrast: () => {
          set((state) => ({
            preferences: { 
              ...state.preferences, 
              highContrast: !state.preferences.highContrast 
            }
          }));
        },
        
        setFontSize: (fontSize) => {
          set((state) => ({
            preferences: { ...state.preferences, fontSize }
          }));
        },
        
        resetPreferences: () => {
          set({ 
            themeMode: 'neural',
            preferences: defaultPreferences 
          });
        }
      }),
      {
        name: 'theme-store',
        partialize: (state) => ({
          themeMode: state.themeMode,
          preferences: state.preferences
        })
      }
    ),
    { name: 'theme-store' }
  )
); 