import {
  createHighlighter,
  type Highlighter,
  type BundledLanguage,
  type BundledTheme,
  type ThemedToken,
  type ThemedTokenWithVariants,
} from 'shiki';
import type { TwoslashShikiReturn } from '@shikijs/twoslash';
import type { TwoslashCdnReturn } from 'twoslash-cdn';

export interface ShikiHighlighterOptions {
  themes?: BundledTheme[];
  langs?: BundledLanguage[];
  defaultTheme?: BundledTheme;
  defaultLang?: BundledLanguage;
}

export interface TokenizedLine {
  tokens: ThemedToken[];
  line: number;
}

export interface HighlightResult {
  lines: TokenizedLine[];
  twoslashData?: TwoslashShikiReturn;
}

export class ShikiHighlighter {
  private highlighter: Highlighter | null = null;
  private twoslashInstance: TwoslashCdnReturn | null = null;
  private options: ShikiHighlighterOptions;
  private initPromise: Promise<void> | null = null;

  constructor(options: ShikiHighlighterOptions = {}) {
    this.options = {
      themes: options.themes || ['github-light', 'github-dark'],
      langs: options.langs || [],  // We'll load languages on demand
      defaultTheme: options.defaultTheme || 'github-light',
      defaultLang: options.defaultLang || 'javascript',
    };
  }

  async initialize(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.performInitialization();
    return this.initPromise;
  }

  private async performInitialization(): Promise<void> {
    // Initialize Shiki highlighter with minimal languages
    // We'll load other languages on demand
    this.highlighter = await createHighlighter({
      themes: this.options.themes!,
      langs: ['javascript', 'typescript', 'html', 'css'],  // Start with common languages
    });

    // Dynamically import twoslash-cdn for client-side usage
    const { createTwoslashFromCDN } = await import('twoslash-cdn');

    this.twoslashInstance = createTwoslashFromCDN({
      compilerOptions: {
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        target: 99, // ESNext
        module: 99, // ESNext
        jsx: 1, // Preserve
        jsxImportSource: 'react',
        moduleResolution: 2, // Node
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        strict: true,
        skipLibCheck: true,
        noEmit: true,
      },
    });

    // Initialize TypeScript types from CDN
    await this.twoslashInstance.init();
  }

  async loadLanguage(lang: string): Promise<void> {
    if (!this.highlighter) {
      await this.initialize();
    }

    const loadedLanguages = this.highlighter!.getLoadedLanguages();
    if (!loadedLanguages.includes(lang as BundledLanguage)) {
      try {
        await this.highlighter!.loadLanguage(lang as BundledLanguage);
      } catch (error) {
        console.warn(`Failed to load language: ${lang}`, error);
        // Fall back to plain text if language loading fails
      }
    }
  }

  async tokenize(
    code: string,
    lang?: BundledLanguage,
    theme?: BundledTheme,
  ): Promise<TokenizedLine[]> {
    await this.initialize();

    if (!this.highlighter) {
      throw new Error('Highlighter not initialized');
    }

    const language = lang || this.options.defaultLang!;
    const selectedTheme = theme || this.options.defaultTheme!;

    // Ensure the language is loaded
    await this.loadLanguage(language);

    // Get tokens from Shiki
    const tokens = this.highlighter.codeToTokens(code, {
      lang: language,
      theme: selectedTheme,
    });

    // Convert to our format
    const lines: TokenizedLine[] = tokens.tokens.map((lineTokens, index) => ({
      tokens: lineTokens,
      line: index + 1,
    }));

    return lines;
  }

  async highlightWithTwoslash(
    code: string,
    lang: BundledLanguage = 'typescript',
    theme?: BundledTheme,
  ): Promise<HighlightResult> {
    await this.initialize();

    if (!this.highlighter || !this.twoslashInstance) {
      throw new Error('Highlighter or TwoSlash not initialized');
    }

    // Ensure the language is loaded
    await this.loadLanguage(lang);

    const selectedTheme = theme || this.options.defaultTheme!;

    // Check if the language supports TwoSlash
    const supportsTwoslash = [
      'typescript',
      'tsx',
      'javascript',
      'jsx',
    ].includes(lang);

    if (!supportsTwoslash) {
      // Just do regular highlighting without TwoSlash
      const lines = await this.tokenize(code, lang, selectedTheme);
      return { lines };
    }

    // TwoSlash expects file extension, not language name
    const ext =
      lang === 'typescript'
        ? 'ts'
        : lang === 'javascript'
        ? 'js'
        : lang === 'tsx'
        ? 'tsx'
        : lang === 'jsx'
        ? 'jsx'
        : 'ts';

    // First prepare types
    await this.twoslashInstance.prepareTypes(code);

    // Then run synchronously which might handle errors better
    let twoslashResult: TwoslashShikiReturn;
    try {
      twoslashResult = this.twoslashInstance.runSync(code, ext, {
        handbookOptions: {
          noErrorValidation: true,
          noStaticSemanticInfo: false,
          keepNotations: true,
        },
      });
      console.log(twoslashResult);
    } catch (error: any) {
      // If there's an error, try to continue anyway with what we have
      // TwoSlash sometimes throws even when it has useful data
      let match: RegExpExecArray | null;
      if (error.twoslashResults) {
        twoslashResult = error.twoslashResults;
      } else if (
        error.description &&
        (match = /The request on line (\d+)/.exec(error.description))
      ) {
        const lines = code.split('\n');
        twoslashResult = {
          code,
          nodes: [
            {
              type: 'error',
              code: ': Twoslash Error',
              text: error.description,
              line: parseInt(match[1]),
              start: lines.slice(0, parseInt(match[1]) - 1).join('\n').length,
              length: lines[parseInt(match[1]) - 1].length + 1,
              character: 0,
            },
          ],
        };
      } else {
        // Fall back to regular highlighting
        const lines = await this.tokenize(code, lang, selectedTheme);
        return { lines };
      }
    }

    // Get tokens for line-by-line rendering
    const tokens = this.highlighter.codeToTokens(code, {
      lang,
      theme: selectedTheme,
    });

    const lines: TokenizedLine[] = tokens.tokens.map((lineTokens, index) => ({
      tokens: lineTokens,
      line: index + 1,
    }));

    // Convert TwoSlash result to our format
    const twoslashData: TwoslashShikiReturn = {
      nodes: twoslashResult.nodes || [],
      code: twoslashResult.code || code,
      meta: twoslashResult.meta
        ? { extension: twoslashResult.meta.extension }
        : undefined,
    };

    return {
      lines,
      twoslashData,
    };
  }

  renderTokensToHtml(tokens: ThemedToken[]): string {
    return tokens
      .map((token) => {
        const style = token.color ? `color: ${token.color}` : '';
        return `<span style="${style}">${this.escapeHtml(
          token.content,
        )}</span>`;
      })
      .join('');
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Extract theme colors including background, foreground, and other UI colors
   */
  getThemeColors(themeName: BundledTheme): { 
    bg: string; 
    fg: string; 
    border: string;
    selection?: string;
    activeLineHighlight?: string;
    searchMatch?: string;
    searchMatchSelected?: string;
  } {
    if (!this.highlighter) {
      return { bg: '#ffffff', fg: '#000000', border: '#e1e4e8' };
    }

    try {
      const theme = this.highlighter.getTheme(themeName);
      const bg = theme.bg || '#ffffff';
      const fg = theme.fg || '#000000';
      
      // Extract actual theme colors from VSCode theme format
      const colors = (theme as any).colors || {};
      
      return { 
        bg, 
        fg, 
        // Use actual theme colors if available, otherwise derive from bg
        border: colors['panel.border'] || 
                colors['editorGroup.border'] || 
                colors['editor.lineHighlightBorder'] ||
                this.mixColors(bg, fg, 0.1),
        selection: colors['editor.selectionBackground'] || 
                   colors['selection.background'] ||
                   this.mixColors(bg, '#0066cc', 0.3),
        activeLineHighlight: colors['editor.lineHighlightBackground'] ||
                            colors['editor.rangeHighlightBackground'] ||
                            this.mixColors(bg, fg, 0.05),
        searchMatch: colors['editor.findMatchBackground'] ||
                    colors['editor.findMatchHighlightBackground'] ||
                    '#ffeb3b',
        searchMatchSelected: colors['editor.findMatchBorder'] ||
                            colors['editor.findMatchHighlightBorder'] ||
                            '#ff5722',
      };
    } catch (error) {
      console.warn('Failed to get theme colors:', error);
      return { bg: '#ffffff', fg: '#000000', border: '#e1e4e8' };
    }
  }

  /**
   * Mix two colors together
   */
  private mixColors(color1: string, color2: string, ratio: number): string {
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');
    
    const r1 = parseInt(hex1.substring(0, 2), 16);
    const g1 = parseInt(hex1.substring(2, 4), 16);
    const b1 = parseInt(hex1.substring(4, 6), 16);
    
    const r2 = parseInt(hex2.substring(0, 2), 16);
    const g2 = parseInt(hex2.substring(2, 4), 16);
    const b2 = parseInt(hex2.substring(4, 6), 16);
    
    const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
    const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
    const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * Check if a color is dark
   */
  isColorDark(color: string): boolean {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  }


  async dispose(): Promise<void> {
    if (this.highlighter) {
      this.highlighter.dispose();
      this.highlighter = null;
    }
    this.twoslashInstance = null;
    this.initPromise = null;
  }

  isInitialized(): boolean {
    return this.highlighter !== null && this.twoslashInstance !== null;
  }

  getSupportedLanguages(): BundledLanguage[] {
    return this.options.langs || [];
  }

  getSupportedThemes(): BundledTheme[] {
    return this.options.themes || [];
  }

  getThemeData(theme?: BundledTheme): any {
    if (!this.highlighter) return null;
    const selectedTheme = theme || this.options.defaultTheme!;
    return this.highlighter.getTheme(selectedTheme);
  }
}
