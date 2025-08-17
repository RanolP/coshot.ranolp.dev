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
      langs: options.langs || [
        'javascript',
        'typescript',
        'tsx',
        'jsx',
        'css',
        'html',
      ],
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
    // Initialize Shiki highlighter
    this.highlighter = await createHighlighter({
      themes: this.options.themes!,
      langs: this.options.langs!,
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
