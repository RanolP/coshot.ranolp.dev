import { createContext, useContext, type Component, type JSX, createEffect, createSignal } from 'solid-js';
import type { BundledTheme } from 'shiki';
import { getThemeColors, type ThemeColors } from '../utils/themeColors';

interface ThemeContextValue {
  theme: () => BundledTheme;
  setTheme: (theme: BundledTheme) => void;
  colors: () => ThemeColors | null;
}

const ThemeContext = createContext<ThemeContextValue>();

export const ThemeProvider: Component<{ children: JSX.Element }> = (props) => {
  const [theme, setTheme] = createSignal<BundledTheme>('github-dark');
  const [colors, setColors] = createSignal<ThemeColors | null>(null);

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