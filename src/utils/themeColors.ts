import type { BundledTheme } from 'shiki';
import { createHighlighter } from 'shiki';

export interface ThemeColors {
  // Editor colors
  'editor.background': string;
  'editor.foreground': string;
  'editor.lineHighlightBackground': string;
  'editor.selectionBackground': string;
  'editor.inactiveSelectionBackground': string;
  
  // Activity Bar
  'activityBar.background': string;
  'activityBar.foreground': string;
  'activityBar.border': string;
  
  // Side Bar
  'sideBar.background': string;
  'sideBar.foreground': string;
  'sideBar.border': string;
  
  // Title Bar
  'titleBar.activeBackground': string;
  'titleBar.activeForeground': string;
  'titleBar.border': string;
  
  // Status Bar
  'statusBar.background': string;
  'statusBar.foreground': string;
  'statusBar.border': string;
  
  // Panel (terminal, output, etc.)
  'panel.background': string;
  'panel.border': string;
  
  // Input controls
  'input.background': string;
  'input.foreground': string;
  'input.border': string;
  'input.placeholderForeground': string;
  
  // Buttons
  'button.background': string;
  'button.foreground': string;
  'button.hoverBackground': string;
  
  // Dropdown
  'dropdown.background': string;
  'dropdown.foreground': string;
  'dropdown.border': string;
  
  // Lists
  'list.hoverBackground': string;
  'list.activeSelectionBackground': string;
  'list.activeSelectionForeground': string;
  'list.inactiveSelectionBackground': string;
  'list.inactiveSelectionForeground': string;
  
  // Scrollbar
  'scrollbarSlider.background': string;
  'scrollbarSlider.hoverBackground': string;
  'scrollbarSlider.activeBackground': string;
  
  // Badge
  'badge.background': string;
  'badge.foreground': string;
  
  // Focus border
  'focusBorder': string;
  
  // Tooltip
  'tooltip.background': string;
  'tooltip.foreground': string;
  'tooltip.border': string;
}

// Default colors for dark theme
const defaultDarkColors: ThemeColors = {
  'editor.background': '#1e1e1e',
  'editor.foreground': '#d4d4d4',
  'editor.lineHighlightBackground': '#2a2a2a',
  'editor.selectionBackground': '#264f78',
  'editor.inactiveSelectionBackground': '#3a3d41',
  
  'activityBar.background': '#2a2a2a',
  'activityBar.foreground': '#ffffff',
  'activityBar.border': '#333333',
  
  'sideBar.background': '#252526',
  'sideBar.foreground': '#cccccc',
  'sideBar.border': '#333333',
  
  'titleBar.activeBackground': '#1a1a1a',
  'titleBar.activeForeground': '#ffffff',
  'titleBar.border': '#333333',
  
  'statusBar.background': '#2a2a2a',
  'statusBar.foreground': '#8c8c8c',
  'statusBar.border': '#333333',
  
  'panel.background': '#1e1e1e',
  'panel.border': '#333333',
  
  'input.background': '#1a1a1a',
  'input.foreground': '#ffffff',
  'input.border': '#555555',
  'input.placeholderForeground': '#888888',
  
  'button.background': '#0e639c',
  'button.foreground': '#ffffff',
  'button.hoverBackground': '#1177bb',
  
  'dropdown.background': '#1a1a1a',
  'dropdown.foreground': '#ffffff',
  'dropdown.border': '#555555',
  
  'list.hoverBackground': '#2a2a2a',
  'list.activeSelectionBackground': '#0969da',
  'list.activeSelectionForeground': '#ffffff',
  'list.inactiveSelectionBackground': '#2a2a2a',
  'list.inactiveSelectionForeground': '#cccccc',
  
  'scrollbarSlider.background': 'rgba(121, 121, 121, 0.4)',
  'scrollbarSlider.hoverBackground': 'rgba(100, 100, 100, 0.7)',
  'scrollbarSlider.activeBackground': 'rgba(191, 191, 191, 0.4)',
  
  'badge.background': '#4d4d4d',
  'badge.foreground': '#ffffff',
  
  'focusBorder': '#0969da',
  
  'tooltip.background': '#0d1117',
  'tooltip.foreground': '#e6edf3',
  'tooltip.border': '#333333',
};

// Default colors for light theme
const defaultLightColors: ThemeColors = {
  'editor.background': '#ffffff',
  'editor.foreground': '#333333',
  'editor.lineHighlightBackground': '#f0f0f0',
  'editor.selectionBackground': '#add6ff',
  'editor.inactiveSelectionBackground': '#e5ebf1',
  
  'activityBar.background': '#f6f8fa',
  'activityBar.foreground': '#1f2328',
  'activityBar.border': '#d0d7de',
  
  'sideBar.background': '#f6f8fa',
  'sideBar.foreground': '#333333',
  'sideBar.border': '#d0d7de',
  
  'titleBar.activeBackground': '#f6f8fa',
  'titleBar.activeForeground': '#1f2328',
  'titleBar.border': '#d0d7de',
  
  'statusBar.background': '#f6f8fa',
  'statusBar.foreground': '#656d76',
  'statusBar.border': '#d0d7de',
  
  'panel.background': '#ffffff',
  'panel.border': '#d0d7de',
  
  'input.background': '#ffffff',
  'input.foreground': '#1f2328',
  'input.border': '#d0d7de',
  'input.placeholderForeground': '#656d76',
  
  'button.background': '#0969da',
  'button.foreground': '#ffffff',
  'button.hoverBackground': '#0860ca',
  
  'dropdown.background': '#ffffff',
  'dropdown.foreground': '#1f2328',
  'dropdown.border': '#d0d7de',
  
  'list.hoverBackground': '#f3f4f6',
  'list.activeSelectionBackground': '#0969da',
  'list.activeSelectionForeground': '#ffffff',
  'list.inactiveSelectionBackground': '#f3f4f6',
  'list.inactiveSelectionForeground': '#333333',
  
  'scrollbarSlider.background': 'rgba(0, 0, 0, 0.1)',
  'scrollbarSlider.hoverBackground': 'rgba(0, 0, 0, 0.2)',
  'scrollbarSlider.activeBackground': 'rgba(0, 0, 0, 0.3)',
  
  'badge.background': '#dbeafe',
  'badge.foreground': '#1e40af',
  
  'focusBorder': '#0969da',
  
  'tooltip.background': '#f6f8fa',
  'tooltip.foreground': '#1f2328',
  'tooltip.border': '#d0d7de',
};

let cachedHighlighter: any = null;
const themeColorsCache = new Map<BundledTheme, ThemeColors>();

export async function getThemeColors(theme: BundledTheme): Promise<ThemeColors> {
  // Check cache first
  if (themeColorsCache.has(theme)) {
    return themeColorsCache.get(theme)!;
  }

  try {
    // Create highlighter if not cached
    if (!cachedHighlighter) {
      cachedHighlighter = await createHighlighter({
        themes: [theme],
        langs: [],
      });
    } else {
      // Load theme if not already loaded
      const loadedThemes = cachedHighlighter.getLoadedThemes();
      if (!loadedThemes.includes(theme)) {
        await cachedHighlighter.loadTheme(theme);
      }
    }

    // Get the theme object from Shiki
    const themeData = cachedHighlighter.getTheme(theme);
    
    // Extract colors from the theme
    const colors = themeData.colors || {};
    const isDark = themeData.type === 'dark';
    const defaults = isDark ? defaultDarkColors : defaultLightColors;
    
    // Map VSCode theme colors to our theme colors
    const themeColors: ThemeColors = {
      'editor.background': colors['editor.background'] || themeData.bg || defaults['editor.background'],
      'editor.foreground': colors['editor.foreground'] || themeData.fg || defaults['editor.foreground'],
      'editor.lineHighlightBackground': colors['editor.lineHighlightBackground'] || defaults['editor.lineHighlightBackground'],
      'editor.selectionBackground': colors['editor.selectionBackground'] || defaults['editor.selectionBackground'],
      'editor.inactiveSelectionBackground': colors['editor.inactiveSelectionBackground'] || defaults['editor.inactiveSelectionBackground'],
      
      'activityBar.background': colors['activityBar.background'] || colors['sideBar.background'] || defaults['activityBar.background'],
      'activityBar.foreground': colors['activityBar.foreground'] || colors['sideBar.foreground'] || defaults['activityBar.foreground'],
      'activityBar.border': colors['activityBar.border'] || colors['panel.border'] || defaults['activityBar.border'],
      
      'sideBar.background': colors['sideBar.background'] || colors['editor.background'] || defaults['sideBar.background'],
      'sideBar.foreground': colors['sideBar.foreground'] || colors['editor.foreground'] || defaults['sideBar.foreground'],
      'sideBar.border': colors['sideBar.border'] || colors['panel.border'] || defaults['sideBar.border'],
      
      'titleBar.activeBackground': colors['titleBar.activeBackground'] || colors['activityBar.background'] || defaults['titleBar.activeBackground'],
      'titleBar.activeForeground': colors['titleBar.activeForeground'] || colors['activityBar.foreground'] || defaults['titleBar.activeForeground'],
      'titleBar.border': colors['titleBar.border'] || colors['panel.border'] || defaults['titleBar.border'],
      
      'statusBar.background': colors['statusBar.background'] || colors['activityBar.background'] || defaults['statusBar.background'],
      'statusBar.foreground': colors['statusBar.foreground'] || colors['activityBar.foreground'] || defaults['statusBar.foreground'],
      'statusBar.border': colors['statusBar.border'] || colors['panel.border'] || defaults['statusBar.border'],
      
      'panel.background': colors['panel.background'] || colors['editor.background'] || defaults['panel.background'],
      'panel.border': colors['panel.border'] || colors['editorGroup.border'] || defaults['panel.border'],
      
      'input.background': colors['input.background'] || defaults['input.background'],
      'input.foreground': colors['input.foreground'] || colors['editor.foreground'] || defaults['input.foreground'],
      'input.border': colors['input.border'] || defaults['input.border'],
      'input.placeholderForeground': colors['input.placeholderForeground'] || defaults['input.placeholderForeground'],
      
      'button.background': colors['button.background'] || defaults['button.background'],
      'button.foreground': colors['button.foreground'] || defaults['button.foreground'],
      'button.hoverBackground': colors['button.hoverBackground'] || defaults['button.hoverBackground'],
      
      'dropdown.background': colors['dropdown.background'] || colors['input.background'] || defaults['dropdown.background'],
      'dropdown.foreground': colors['dropdown.foreground'] || colors['input.foreground'] || defaults['dropdown.foreground'],
      'dropdown.border': colors['dropdown.border'] || colors['input.border'] || defaults['dropdown.border'],
      
      'list.hoverBackground': colors['list.hoverBackground'] || colors['editor.hoverHighlightBackground'] || defaults['list.hoverBackground'],
      'list.activeSelectionBackground': colors['list.activeSelectionBackground'] || colors['editor.selectionBackground'] || defaults['list.activeSelectionBackground'],
      'list.activeSelectionForeground': colors['list.activeSelectionForeground'] || colors['editor.selectionForeground'] || colors['editor.foreground'] || defaults['list.activeSelectionForeground'],
      'list.inactiveSelectionBackground': colors['list.inactiveSelectionBackground'] || colors['editor.inactiveSelectionBackground'] || defaults['list.inactiveSelectionBackground'],
      'list.inactiveSelectionForeground': colors['list.inactiveSelectionForeground'] || colors['editor.foreground'] || defaults['list.inactiveSelectionForeground'],
      
      'scrollbarSlider.background': colors['scrollbarSlider.background'] || defaults['scrollbarSlider.background'],
      'scrollbarSlider.hoverBackground': colors['scrollbarSlider.hoverBackground'] || defaults['scrollbarSlider.hoverBackground'],
      'scrollbarSlider.activeBackground': colors['scrollbarSlider.activeBackground'] || defaults['scrollbarSlider.activeBackground'],
      
      'badge.background': colors['badge.background'] || defaults['badge.background'],
      'badge.foreground': colors['badge.foreground'] || defaults['badge.foreground'],
      
      'focusBorder': colors['focusBorder'] || defaults['focusBorder'],
      
      'tooltip.background': colors['tooltip.background'] || colors['panel.background'] || defaults['tooltip.background'],
      'tooltip.foreground': colors['tooltip.foreground'] || colors['editor.foreground'] || defaults['tooltip.foreground'],
      'tooltip.border': colors['tooltip.border'] || colors['panel.border'] || defaults['tooltip.border'],
    };
    
    // Cache the result
    themeColorsCache.set(theme, themeColors);
    
    return themeColors;
  } catch (error) {
    console.warn(`Failed to load theme colors for ${theme}, using defaults`, error);
    const isDark = theme.includes('dark') || theme.includes('night') || theme.includes('black');
    return isDark ? defaultDarkColors : defaultLightColors;
  }
}

