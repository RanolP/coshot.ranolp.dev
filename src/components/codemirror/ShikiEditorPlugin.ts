import {
  ViewPlugin,
  ViewUpdate,
  Decoration,
  EditorView,
} from '@codemirror/view';
import type { DecorationSet } from '@codemirror/view';
import { RangeSetBuilder, StateEffect, StateField, Compartment } from '@codemirror/state';
import type { Extension } from '@codemirror/state';
import { ShikiHighlighter } from './ShikiHighlighter';
import type { BundledLanguage, BundledTheme } from 'shiki';

interface ShikiEditorPluginConfig {
  language?: BundledLanguage;
  theme?: BundledTheme;
  highlighter?: ShikiHighlighter;
}

interface ThemeColors {
  background: string;
  foreground: string;
  selectionBackground?: string;
  lineHighlight?: string;
}

// State effect for updating theme colors
const setThemeColors = StateEffect.define<ThemeColors>();

// State field to store theme colors
const themeColorsField = StateField.define<ThemeColors>({
  create() {
    return {
      background: '#ffffff',
      foreground: '#000000',
    };
  },
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setThemeColors)) {
        return effect.value;
      }
    }
    return value;
  },
});

class ShikiEditorView {
  decorations: DecorationSet;
  public view: EditorView;
  private highlighter: ShikiHighlighter;
  private language: BundledLanguage;
  private theme: BundledTheme;
  private updateTimeout: number | null = null;
  private lastContent: string = '';

  constructor(
    view: EditorView,
    config: ShikiEditorPluginConfig
  ) {
    this.view = view;
    this.highlighter = config.highlighter || new ShikiHighlighter();
    this.language = config.language || 'javascript';
    this.theme = config.theme || 'github-light';
    this.decorations = Decoration.none;
    
    // Initial highlighting
    this.updateDecorations();
  }

  update(update: ViewUpdate) {
    // Check for config updates
    for (const tr of [update.transactions].flat()) {
      for (const effect of tr.effects) {
        if (effect.is(updateShikiConfig)) {
          const { language, theme } = effect.value;
          if (language && language !== this.language) {
            this.setLanguage(language);
          }
          if (theme && theme !== this.theme) {
            this.setTheme(theme);
          }
        }
      }
    }
    
    if (update.docChanged || update.viewportChanged) {
      this.scheduleUpdate();
    }
  }

  private scheduleUpdate() {
    if (this.updateTimeout !== null) {
      clearTimeout(this.updateTimeout);
    }
    
    // Debounce updates for performance
    this.updateTimeout = window.setTimeout(() => {
      this.updateDecorations();
      this.updateTimeout = null;
    }, 100);
  }

  private async updateDecorations() {
    const content = this.view.state.doc.toString();
    
    // Skip if content hasn't changed
    if (content === this.lastContent && this.decorations !== Decoration.none) {
      return;
    }
    
    this.lastContent = content;
    
    if (!content) {
      this.decorations = Decoration.none;
      this.view.dispatch();
      return;
    }

    try {
      // Get tokenized lines from Shiki
      const lines = await this.highlighter.tokenize(
        content,
        this.language,
        this.theme
      );
      
      // Extract theme colors from Shiki
      const themeColors = await this.getThemeColors();

      const builder = new RangeSetBuilder<Decoration>();
      let pos = 0;

      for (const { tokens } of lines) {
        for (const token of tokens) {
          const from = pos;
          const to = pos + token.content.length;
          
          if (token.color) {
            const decoration = Decoration.mark({
              attributes: {
                style: `color: ${token.color}`,
              },
              class: 'shiki-token',
            });
            
            builder.add(from, to, decoration);
          }
          
          pos = to;
        }
        
        // Account for newline character
        if (pos < content.length && content[pos] === '\n') {
          pos++;
        }
      }

      this.decorations = builder.finish();
      
      // Update theme colors and force a view update
      this.view.dispatch({
        effects: [
          setThemeColors.of(themeColors),
          themeCompartment.reconfigure(themeFromColors(themeColors)),
        ],
      });
    } catch (error) {
      console.error('Error highlighting with Shiki:', error);
      this.decorations = Decoration.none;
    }
  }
  
  private async getThemeColors(): Promise<ThemeColors> {
    // Get theme data from Shiki
    const themeData = this.highlighter.getThemeData(this.theme);
    
    if (!themeData) {
      return {
        background: '#ffffff',
        foreground: '#000000',
      };
    }
    
    return {
      background: themeData.bg || '#ffffff',
      foreground: themeData.fg || '#000000',
      selectionBackground: themeData.colors?.['editor.selectionBackground'] || 
                           themeData.colors?.['selection.background'] || undefined,
      lineHighlight: themeData.colors?.['editor.lineHighlightBackground'] || 
                     themeData.colors?.['lineHighlight.background'] || undefined,
    };
  }

  destroy() {
    if (this.updateTimeout !== null) {
      clearTimeout(this.updateTimeout);
    }
  }

  setLanguage(language: BundledLanguage) {
    if (this.language !== language) {
      this.language = language;
      this.lastContent = ''; // Force re-highlight
      this.updateDecorations();
    }
  }

  setTheme(theme: BundledTheme) {
    if (this.theme !== theme) {
      this.theme = theme;
      this.lastContent = ''; // Force re-highlight
      this.updateDecorations();
    }
  }
  
  getLanguage(): BundledLanguage {
    return this.language;
  }
  
  getTheme(): BundledTheme {
    return this.theme;
  }
}

// Create a compartment for dynamic theme updates
const themeCompartment = new Compartment();

// Create a theme extension based on current colors
function themeFromColors(colors: ThemeColors): Extension {
  return EditorView.theme({
    '&': {
      backgroundColor: colors.background + ' !important',
      color: colors.foreground + ' !important',
    },
    '.cm-editor': {
      backgroundColor: colors.background + ' !important',
      color: colors.foreground + ' !important',
    },
    '.cm-editor.cm-focused': {
      outline: 'none',
    },
    '.cm-content': {
      backgroundColor: colors.background + ' !important',
      color: colors.foreground + ' !important',
      caretColor: colors.foreground + ' !important',
    },
    '.cm-gutters': {
      backgroundColor: colors.background + ' !important',
      color: colors.foreground + '80 !important',
      borderRight: `1px solid ${colors.foreground}20 !important`,
    },
    '.cm-activeLineGutter': {
      backgroundColor: colors.lineHighlight || `${colors.foreground}10` + ' !important',
    },
    '.cm-activeLine': {
      backgroundColor: colors.lineHighlight || `${colors.foreground}08` + ' !important',
    },
    '.cm-selectionBackground, ::selection': {
      backgroundColor: colors.selectionBackground || `${colors.foreground}20` + ' !important',
    },
    '.cm-cursor, .cm-cursor-primary': {
      borderLeftColor: colors.foreground + ' !important',
    },
    '.cm-line': {
      color: colors.foreground + ' !important',
    },
    '.cm-scroller': {
      backgroundColor: colors.background + ' !important',
    },
  });
}

// State effect for updating configuration
export const updateShikiConfig = StateEffect.define<{
  language?: BundledLanguage;
  theme?: BundledTheme;
}>();

// Export the theme compartment so it can be used elsewhere if needed
export { themeCompartment };

export function shikiEditorPlugin(
  config: ShikiEditorPluginConfig = {}
): Extension[] {
  const plugin = ViewPlugin.define(
    (view) => new ShikiEditorView(view, config),
    {
      decorations: (v) => v.decorations,
    }
  );
  
  // Initialize with default theme colors
  const initialTheme = themeCompartment.of(
    themeFromColors({
      background: config.theme === 'github-dark' ? '#0d1117' : '#ffffff',
      foreground: config.theme === 'github-dark' ? '#c9d1d9' : '#24292e',
    })
  );
  
  return [themeColorsField, initialTheme, plugin];
}

// Helper function to create the plugin with a shared highlighter instance
export async function createShikiEditorExtension(
  config: {
    language?: BundledLanguage;
    theme?: BundledTheme;
    themes?: BundledTheme[];
    langs?: BundledLanguage[];
  } = {}
): Promise<Extension> {
  const highlighter = new ShikiHighlighter({
    themes: config.themes,
    langs: config.langs,
  });
  
  // Pre-initialize the highlighter
  await highlighter.initialize();
  
  return shikiEditorPlugin({
    language: config.language,
    theme: config.theme,
    highlighter,
  });
}

// Facet for dynamic language/theme updates
import { Facet } from '@codemirror/state';

export const shikiConfig = Facet.define<
  ShikiEditorPluginConfig,
  ShikiEditorPluginConfig
>({
  combine(configs) {
    return configs[configs.length - 1] || {};
  },
});