import {
  ViewPlugin,
  ViewUpdate,
  EditorView,
  hoverTooltip,
  Decoration,
  showTooltip,
} from '@codemirror/view';
import type { DecorationSet, Tooltip } from '@codemirror/view';
import { StateField, StateEffect, RangeSetBuilder } from '@codemirror/state';
import type { Extension } from '@codemirror/state';
import { ShikiHighlighter } from './ShikiHighlighter';
import { updateShikiConfig } from './ShikiEditorPlugin';
import type { NodeHover, NodeCompletion, NodeError, NodeQuery } from 'twoslash';
import type { TwoslashShikiReturn } from '@shikijs/twoslash';
import type { BundledLanguage, BundledTheme } from 'shiki';

interface TwoslashTooltipConfig {
  highlighter?: ShikiHighlighter;
  language?: BundledLanguage;
  theme?: BundledTheme;
  delay?: number;
}

interface TwoslashData {
  hovers: Map<number, NodeHover>;
  errors: Map<number, NodeError>;
  queries: Map<number, NodeQuery>;
  completions: Map<number, NodeCompletion[]>;
}

// State effect for updating TwoSlash data
const setTwoslashData = StateEffect.define<TwoslashData>();

// State effect for updating theme in decorations
const updateTooltipTheme = StateEffect.define<BundledTheme>();

// State field to store current theme
const currentThemeField = StateField.define<BundledTheme>({
  create() {
    return 'github-light';
  },
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(updateTooltipTheme)) {
        return effect.value;
      }
      if (effect.is(updateShikiConfig)) {
        const { theme } = effect.value;
        if (theme) {
          return theme;
        }
      }
    }
    return value;
  },
});

// State field to store TwoSlash data
const twoslashDataField = StateField.define<TwoslashData>({
  create() {
    return {
      hovers: new Map(),
      errors: new Map(),
      queries: new Map(),
      completions: new Map(),
    };
  },
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setTwoslashData)) {
        return effect.value;
      }
    }
    return value;
  },
});

// State field for query tooltips using showTooltip
const createQueryTooltipsField = (
  highlighter?: ShikiHighlighter,
  language?: BundledLanguage,
  initialTheme?: BundledTheme,
) => {
  let currentTheme = initialTheme || 'github-light';

  return StateField.define<readonly Tooltip[]>({
    create() {
      return [];
    },
    update(tooltips, tr) {
      let shouldRebuild = false;
      let data: TwoslashData | null = null;

      // Check for theme updates
      for (const effect of tr.effects) {
        if (effect.is(updateTooltipTheme)) {
          currentTheme = effect.value;
          shouldRebuild = true;
          // Get current data from state
          data = tr.state.field(twoslashDataField);
        }
        if (effect.is(updateShikiConfig)) {
          const { theme } = effect.value;
          if (theme) {
            currentTheme = theme;
            shouldRebuild = true;
            // Get current data from state
            data = tr.state.field(twoslashDataField);
          }
        }
        if (effect.is(setTwoslashData)) {
          data = effect.value;
          shouldRebuild = true;
        }
      }

      if (shouldRebuild && data && data.queries.size > 0) {
        // Sort queries by actual position to ensure proper ordering
        const sortedQueries = Array.from(data.queries.entries()).sort(
          (a, b) => a[1].start - b[1].start,
        );

        // Create tooltips for all queries
        const newTooltips: Tooltip[] = [];
        for (const [, query] of sortedQueries) {
          // With keepNotations: true, use the line/character position from TwoSlash
          const targetPos = tr.state.doc.line(query.line + 1).from + query.character;
          
          const tooltip: Tooltip = {
            pos: targetPos,
            above: true,
            strictSide: true,
            arrow: true,
            create: () => {
              return {
                dom: createQueryTooltipDOM(
                  query.text || '',
                  query.docs,
                  highlighter,
                  language,
                  currentTheme,
                ),
              };
            },
          };
          newTooltips.push(tooltip);
        }

        return newTooltips;
      } else if (shouldRebuild) {
        // Clear tooltips if no queries
        return [];
      }

      return tooltips;
    },
    provide: (f) => showTooltip.computeN([f], (state) => state.field(f)),
  });
};

// Function to create query tooltip DOM
function createQueryTooltipDOM(
  text: string,
  docs?: string,
  highlighter?: ShikiHighlighter,
  _language?: BundledLanguage,
  theme?: BundledTheme,
): HTMLElement {
  // Determine colors based on theme
  const isDark = theme && theme.includes('dark');
  const bgColor = isDark ? '#1e1e1e' : '#ffffff';
  const borderColor = isDark ? '#454545' : '#d1d5db';
  const textColor = isDark ? '#d4d4d4' : '#1f2937';
  const shadowColor = isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.15)';

  const container = document.createElement('div');
  container.className = 'cm-twoslash-query-tooltip';
  container.style.cssText = `
    padding: 8px 12px;
    background: ${bgColor};
    color: ${textColor};
    border: 1px solid ${borderColor};
    border-radius: 6px;
    font-size: 12px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    min-width: 200px;
    max-width: 500px;
    white-space: nowrap;
    overflow: visible;
    z-index: 1000;
    box-shadow: 0 2px 8px ${shadowColor};
    pointer-events: none;
  `;

  // Add type info
  const typeDiv = document.createElement('div');
  typeDiv.className = 'cm-twoslash-type-content';
  typeDiv.style.cssText = `
    white-space: pre;
    overflow-x: auto;
    max-width: 100%;
  `;

  // Apply syntax highlighting asynchronously
  if (highlighter && highlighter.isInitialized()) {
    renderHighlightedCode(text || '(no type info)', highlighter, theme).then((html) => {
      typeDiv.innerHTML = html;
    });
  } else {
    typeDiv.textContent = text || '(no type info)';
  }

  container.appendChild(typeDiv);

  // Add docs if available
  if (docs) {
    const docsDiv = document.createElement('div');
    docsDiv.textContent = docs;
    const docsColor = isDark ? '#9cdcfe' : '#0969da';
    docsDiv.style.cssText = `
      margin-top: 6px;
      padding-top: 6px;
      border-top: 1px solid ${borderColor};
      color: ${docsColor};
      font-size: 11px;
      white-space: pre-wrap;
      max-width: 500px;
    `;
    container.appendChild(docsDiv);
  }

  return container;
}

// Helper function to render highlighted code
async function renderHighlightedCode(
  code: string,
  highlighter: ShikiHighlighter,
  theme?: BundledTheme,
): Promise<string> {
  if (!highlighter.isInitialized()) {
    return escapeHtml(code);
  }

  try {
    // Use TypeScript for type information highlighting with current theme
    const tokens = await highlighter.tokenize(code, 'typescript', theme);
    if (tokens.length > 0) {
      return highlighter.renderTokensToHtml(tokens[0].tokens);
    }
  } catch (e) {
    // Fall back to plain text if highlighting fails
  }

  return escapeHtml(code);
}


class TwoslashTooltipView {
  public view: EditorView;
  private highlighter: ShikiHighlighter;
  private language: BundledLanguage;
  private theme: BundledTheme;
  private updateTimeout: number | null = null;
  private lastContent: string = '';
  decorations: DecorationSet = Decoration.none;

  constructor(view: EditorView, config: TwoslashTooltipConfig) {
    this.view = view;
    this.highlighter = config.highlighter || new ShikiHighlighter();
    this.language = config.language || 'typescript';
    this.theme = config.theme || 'github-light';

    // Initial TwoSlash analysis
    this.updateTwoslashData();
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
            this.theme = theme;
            // Force re-analysis with new theme to update highlighting
            this.lastContent = ''; // Force re-analysis
            this.scheduleUpdate();
            // Also dispatch effect to update existing tooltip decorations
            this.view.dispatch({
              effects: updateTooltipTheme.of(theme),
            });
          }
        }
      }
    }

    if (update.docChanged) {
      this.scheduleUpdate();
    }
  }

  private scheduleUpdate() {
    if (this.updateTimeout !== null) {
      clearTimeout(this.updateTimeout);
    }

    // Debounce updates for performance
    this.updateTimeout = window.setTimeout(() => {
      this.updateTwoslashData();
      this.updateTimeout = null;
    }, 500);
  }

  private async updateTwoslashData() {
    const content = this.view.state.doc.toString();

    // Skip if content hasn't changed
    if (content === this.lastContent) {
      return;
    }

    this.lastContent = content;

    if (!content) {
      return;
    }

    // Check if language supports TwoSlash
    if (!['typescript', 'tsx', 'javascript', 'jsx'].includes(this.language)) {
      return;
    }

    // Ensure highlighter is initialized
    if (!this.highlighter.isInitialized()) {
      await this.highlighter.initialize();
    }

    // Get TwoSlash data from highlighter with current theme
    const result = await this.highlighter.highlightWithTwoslash(
      content,
      this.language,
      this.theme,
    );

    if (result.twoslashData) {
      const data = this.processTwoslashData(result.twoslashData);

      // Update state with new TwoSlash data
      this.view.dispatch({
        effects: setTwoslashData.of(data),
      });
    }
  }

  private processTwoslashData(twoslashData: TwoslashShikiReturn): TwoslashData {
    const hovers = new Map<number, NodeHover>();
    const errors = new Map<number, NodeError>();
    const queries = new Map<number, NodeQuery>();
    const completions = new Map<number, NodeCompletion[]>();

    // Process nodes from twoslashData
    if (twoslashData.nodes) {
      let queryIndex = 0;
      for (const node of twoslashData.nodes) {
        if (node.type === 'hover') {
          hovers.set(node.start, node as NodeHover);
        } else if (node.type === 'error') {
          errors.set(node.start, node as NodeError);
        } else if (node.type === 'query') {
          // Use a unique key that combines position and index to handle multiple queries
          const uniqueKey = node.start * 10000 + queryIndex++;
          queries.set(uniqueKey, { ...(node as NodeQuery), start: node.start });
        } else if (node.type === 'completion') {
          if (!completions.has(node.start)) {
            completions.set(node.start, []);
          }
          completions.get(node.start)!.push(node as NodeCompletion);
        }
      }
    }

    return { hovers, errors, queries, completions };
  }

  destroy() {
    if (this.updateTimeout !== null) {
      clearTimeout(this.updateTimeout);
    }
  }

  setLanguage(language: BundledLanguage) {
    if (this.language !== language) {
      this.language = language;
      this.lastContent = ''; // Force re-analysis
      this.updateTwoslashData();
    }
  }
}

// Create hover tooltip extension
function createHoverTooltip(config: TwoslashTooltipConfig = {}): Extension {
  return hoverTooltip(
    (view, pos) => {
      const data = view.state.field(twoslashDataField);
      const currentTheme = view.state.field(currentThemeField);

      // Check for hover info at current position
      let hoverInfo: NodeHover | null = null;
      let errorInfo: NodeError | null = null;

      // Find relevant hover or error at position
      for (const [start, hover] of data.hovers) {
        if (pos >= start && pos < start + hover.length) {
          hoverInfo = hover;
          break;
        }
      }

      for (const [start, error] of data.errors) {
        if (pos >= start && pos < start + error.length) {
          errorInfo = error;
          break;
        }
      }

      if (!hoverInfo && !errorInfo) {
        return null;
      }

      // Create tooltip content
      let content = '';

      if (errorInfo) {
        content = `<div class="twoslash-error-tooltip">
        <div class="error-code">TS${errorInfo.code}</div>
        <div class="error-message">${escapeHtml(errorInfo.text)}</div>
      </div>`;
      } else if (hoverInfo) {
        const text = hoverInfo.text || '';
        const docs = hoverInfo.docs || '';

        content = `<div class="twoslash-hover-tooltip">
        <div class="hover-type">${escapeHtml(text)}</div>
        ${docs ? `<div class="hover-docs">${escapeHtml(docs)}</div>` : ''}
      </div>`;
      }

      return {
        pos,
        above: true,
        create() {
          const dom = document.createElement('div');
          dom.className = 'cm-twoslash-tooltip';
          dom.innerHTML = content;

          // Determine colors based on theme
          const isDark = currentTheme && currentTheme.includes('dark');
          const bgColor = isDark ? '#1e1e1e' : '#ffffff';
          const borderColor = isDark ? '#454545' : '#d1d5db';
          const textColor = isDark ? '#d4d4d4' : '#1f2937';

          // Apply styles
          dom.style.padding = '8px 12px';
          dom.style.borderRadius = '6px';
          dom.style.backgroundColor = bgColor;
          dom.style.color = textColor;
          dom.style.border = `1px solid ${borderColor}`;
          dom.style.fontSize = '13px';
          dom.style.maxWidth = '500px';
          dom.style.lineHeight = '1.4';

          // Style error tooltips differently
          const errorTooltip = dom.querySelector('.twoslash-error-tooltip');
          if (errorTooltip) {
            (errorTooltip as HTMLElement).style.borderLeft =
              '3px solid #f14c4c';
            (errorTooltip as HTMLElement).style.paddingLeft = '8px';
          }

          const errorCode = dom.querySelector('.error-code');
          if (errorCode) {
            (errorCode as HTMLElement).style.color = '#f14c4c';
            (errorCode as HTMLElement).style.fontWeight = 'bold';
            (errorCode as HTMLElement).style.marginBottom = '4px';
          }

          const hoverType = dom.querySelector('.hover-type');
          if (hoverType) {
            (hoverType as HTMLElement).style.fontFamily = 'monospace';
            (hoverType as HTMLElement).style.whiteSpace = 'pre-wrap';
          }

          const hoverDocs = dom.querySelector('.hover-docs');
          if (hoverDocs) {
            (hoverDocs as HTMLElement).style.marginTop = '8px';
            (hoverDocs as HTMLElement).style.paddingTop = '8px';
            (hoverDocs as HTMLElement).style.borderTop = '1px solid #454545';
            (hoverDocs as HTMLElement).style.color = '#9cdcfe';
          }

          return { dom };
        },
      };
    },
    {
      hideOnChange: true,
      hoverTime: config.delay || 300,
    },
  );
}

// Helper function to escape HTML
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Create underline decorations for errors
const errorUnderlineField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    // Check if we have new TwoSlash data
    for (const effect of tr.effects) {
      if (effect.is(setTwoslashData)) {
        const data = effect.value;
        const builder = new RangeSetBuilder<Decoration>();

        // Add underlines for errors
        for (const [start, error] of data.errors) {
          const decoration = Decoration.mark({
            class: 'cm-twoslash-error',
            attributes: {
              style:
                'text-decoration: underline wavy #f14c4c; text-underline-offset: 3px;',
            },
          });
          builder.add(start, start + error.length, decoration);
        }

        return builder.finish();
      }
    }

    return decorations.map(tr.changes);
  },
  provide: (f) => EditorView.decorations.from(f),
});

// Main plugin export
export function twoslashTooltipPlugin(
  config: TwoslashTooltipConfig = {},
): Extension[] {
  const queryTooltipsField = createQueryTooltipsField(
    config.highlighter,
    config.language,
    config.theme,
  );

  return [
    twoslashDataField,
    currentThemeField.init(() => config.theme || 'github-light'),
    queryTooltipsField,
    errorUnderlineField,
    ViewPlugin.define((view) => new TwoslashTooltipView(view, config), {
      decorations: (v) => v.decorations,
    }),
    createHoverTooltip(config),
    // Add styles for query tooltips
    EditorView.baseTheme({
      '.cm-twoslash-query-tooltip': {
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      },
      '.cm-twoslash-type-content': {
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      },
    }),
  ];
}

// Helper to create the complete TwoSlash extension
export async function createTwoslashExtension(
  config: {
    language?: BundledLanguage;
    themes?: string[];
    langs?: string[];
    delay?: number;
  } = {},
): Promise<Extension[]> {
  const highlighter = new ShikiHighlighter({
    themes: config.themes as any,
    langs: config.langs as any,
  });

  // Pre-initialize the highlighter
  await highlighter.initialize();

  return twoslashTooltipPlugin({
    highlighter,
    language: config.language,
    delay: config.delay,
  });
}
