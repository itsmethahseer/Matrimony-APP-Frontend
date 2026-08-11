// @ts-ignore
import '@/global.css';
import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0f172a',                  // Slate dark text
    textSecondary: '#475569',         // Slate secondary text
    onSurfaceVariant: '#475569',
    background: '#f8fafc',            // HelpMeet crisp slate background
    primary: '#065f46',               // Deep Royal Emerald Green
    secondary: '#d97706',             // Warm Golden Amber
    secondaryContainer: '#fef3c7',    // Light Gold Container
    onSecondaryContainer: '#78350f',
    backgroundElement: '#f1f5f9',
    backgroundSelected: '#e2e8f0',
    surface: '#ffffff',               // Pure White Card Surface
    surfaceVariant: '#e2e8f0',
    surfaceContainerLow: '#f8fafc',
    surfaceContainer: '#f1f5f9',      // Slate Container
    outlineVariant: '#cbd5e1',
    emerald: '#10b981',               // online indicator
    white: '#ffffff',
    error: '#ef4444',
    onPrimaryContainer: '#34d399',
  },
  dark: {
    text: '#f8fafc',                  // Light cream/white text
    textSecondary: '#94a3b8',
    onSurfaceVariant: '#94a3b8',
    background: '#0f172a',            // Dark Slate background
    primary: '#34d399',               // Emerald Glow Primary
    secondary: '#fbbf24',             // Bright Amber Gold
    secondaryContainer: '#78350f',
    onSecondaryContainer: '#fef3c7',
    backgroundElement: '#1e293b',
    backgroundSelected: '#334155',
    surface: '#1e293b',
    surfaceVariant: '#334155',
    surfaceContainerLow: '#0f172a',
    surfaceContainer: '#1e293b',
    outlineVariant: '#475569',
    emerald: '#10b981',
    white: '#ffffff',
    error: '#f87171',
    onPrimaryContainer: '#064e3b',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'Plus Jakarta Sans',
    serif: 'Playfair Display',
    rounded: 'normal',
    mono: 'monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'Plus Jakarta Sans',
    serif: 'Playfair Display',
    rounded: 'normal',
    mono: 'monospace',
  },
});

export const Spacing = {
  half: 4,
  one: 8,
  two: 12,
  three: 16,
  four: 20,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
