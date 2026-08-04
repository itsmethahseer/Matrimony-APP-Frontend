// @ts-ignore
import '@/global.css';
import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1e1b18',                  // on-surface dark text
    textSecondary: '#584141',         // secondary text
    onSurfaceVariant: '#584141',
    background: '#fff8f5',            // SoulMate peach background
    primary: '#570013',               // deep maroon
    secondary: '#735c00',             // gold
    secondaryContainer: '#fed65b',    // light gold container
    onSecondaryContainer: '#745c00',
    backgroundElement: '#fbf2ed',
    backgroundSelected: '#f5ece7',
    surface: '#fff8f5',
    surfaceVariant: '#e9e1dc',
    surfaceContainerLow: '#fbf2ed',
    surfaceContainer: '#f5ece7',      // container grey/peach
    outlineVariant: '#e0bfbf',
    emerald: '#10b981',               // online indicator
    white: '#ffffff',
    error: '#ba1a1a',
    onPrimaryContainer: '#ff828a',
  },
  dark: {
    text: '#f8efea',                  // light cream text
    textSecondary: '#a9a8a4',
    onSurfaceVariant: '#a9a8a4',
    background: '#1b1a18',            // dark grey/brown background
    primary: '#ffdada',               // primary-fixed-dim
    secondary: '#e9c349',             // secondary-fixed-dim
    secondaryContainer: '#745c00',
    onSecondaryContainer: '#ffe088',
    backgroundElement: '#3d3d3b',
    backgroundSelected: '#474744',
    surface: '#24201e',
    surfaceVariant: '#3d3d3b',
    surfaceContainerLow: '#1e1b18',
    surfaceContainer: '#34302c',
    outlineVariant: '#474744',
    emerald: '#10b981',
    white: '#ffffff',
    error: '#ffdad6',
    onPrimaryContainer: '#40000b',
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
