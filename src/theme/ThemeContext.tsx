import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import { storage } from '../store/storage';
import { darkColors, lightColors } from './colors';
import type { AppTheme } from './types';
import { useDesignTokens } from './useDesignTokens';

const THEME_KEY = 'theme-mode';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType extends Omit<AppTheme, 'mode'> {
  mode: ThemeMode;
  systemColorScheme: 'light' | 'dark' | null | undefined;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const systemColorScheme = useColorScheme();
  const tokens = useDesignTokens();

  // Load initial mode from storage, default to 'system'
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    const loadTheme = async () => {
      const stored = await storage.getItem(THEME_KEY);
      if (stored) {
        setModeState(stored as ThemeMode);
      }
    };
    loadTheme();
  }, []);

  // Persist mode changes
  const setMode = (newMode: ThemeMode) => {
    storage.setItem(THEME_KEY, newMode);
    setModeState(newMode);
  };

  const toggleMode = () => {
    const nextMode =
      mode === 'system'
        ? systemColorScheme === 'dark'
          ? 'light'
          : 'dark'
        : mode === 'dark'
          ? 'light'
          : 'dark';
    setMode(nextMode);
  };

  // Determine active color scheme
  const isDark = useMemo(() => {
    if (mode === 'system') return systemColorScheme === 'dark';
    return mode === 'dark';
  }, [mode, systemColorScheme]);

  const activeColors = isDark ? darkColors : lightColors;

  // Build the full theme object
  const value = useMemo(
    (): ThemeContextType => ({
      ...tokens,
      colors: activeColors,
      isDark,
      mode, // The preference
      systemColorScheme:
        systemColorScheme === 'dark' || systemColorScheme === 'light'
          ? systemColorScheme
          : undefined,
      setMode,
      toggleMode,
    }),
    [tokens, activeColors, isDark, mode, systemColorScheme, setMode, toggleMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const useAppTheme = useTheme;

