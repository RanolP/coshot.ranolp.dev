import {
  createContext,
  useContext,
  type Component,
  type JSX,
  createEffect,
  createSignal,
  onMount,
} from 'solid-js';
import type { BundledTheme } from 'shiki';
import { getThemeColors, type ThemeColors } from '../utils/themeColors';

interface ThemeContextValue {
  theme: () => BundledTheme;
  setTheme: (theme: BundledTheme) => void;
  colors: () => ThemeColors | null;
}

const ThemeContext = createContext<ThemeContextValue>();

const STORAGE_KEY = 'coshot-editor-theme';

const VALID_THEMES: BundledTheme[] = [
  'github-dark',
  'github-light',
  'andromeeda',
  'aurora-x',
  'ayu-dark',
  'catppuccin-frappe',
  'catppuccin-macchiato',
  'catppuccin-mocha',
  'catppuccin-latte',
  'dark-plus',
  'dracula',
  'dracula-soft',
  'everforest-dark',
  'everforest-light',
  'github-dark-default',
  'github-dark-dimmed',
  'github-dark-high-contrast',
  'github-light-default',
  'github-light-high-contrast',
  'gruvbox-dark-hard',
  'gruvbox-dark-medium',
  'gruvbox-dark-soft',
  'gruvbox-light-hard',
  'gruvbox-light-medium',
  'gruvbox-light-soft',
  'houston',
  'kanagawa-dragon',
  'kanagawa-wave',
  'kanagawa-lotus',
  'laserwave',
  'light-plus',
  'material-theme',
  'material-theme-darker',
  'material-theme-ocean',
  'material-theme-palenight',
  'material-theme-lighter',
  'min-dark',
  'min-light',
  'monokai',
  'night-owl',
  'nord',
  'one-dark-pro',
  'one-light',
  'plastic',
  'poimandres',
  'red',
  'rose-pine',
  'rose-pine-dawn',
  'rose-pine-moon',
  'slack-dark',
  'slack-ochin',
  'snazzy-light',
  'solarized-dark',
  'solarized-light',
  'synthwave-84',
  'tokyo-night',
  'vesper',
  'vitesse-black',
  'vitesse-dark',
  'vitesse-light',
];

const getInitialTheme = (): BundledTheme => {
  // Try to get theme from localStorage
  const storedTheme = localStorage.getItem(STORAGE_KEY);

  if (storedTheme && VALID_THEMES.includes(storedTheme as BundledTheme)) {
    return storedTheme as BundledTheme;
  }

  // Fallback to media query preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'github-dark' : 'github-light';
};

export const ThemeProvider: Component<{ children: JSX.Element }> = (props) => {
  const [theme, setThemeSignal] = createSignal<BundledTheme>(getInitialTheme());
  const [colors, setColors] = createSignal<ThemeColors | null>(null);

  const setTheme = (newTheme: BundledTheme) => {
    setThemeSignal(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
  };

  // Load theme colors whenever theme changes
  createEffect(async () => {
    const currentTheme = theme();
    const themeColors = await getThemeColors(currentTheme);
    setColors(themeColors);

    // Apply CSS variables to the root element
    if (themeColors) {
      const root = document.documentElement;
      Object.entries(themeColors).forEach(([key, value]) => {
        const cssVarName = `--theme-${key.replace(/\./g, '-')}`;
        root.style.setProperty(cssVarName, value);
      });
    }
  });

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors }}>
      {props.children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
