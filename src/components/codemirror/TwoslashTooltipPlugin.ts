import {
  ViewPlugin,
  ViewUpdate,
  EditorView,
  hoverTooltip,
  Decoration,
  showTooltip,
} from '@codemirror/view';
import type { DecorationSet, Tooltip } from '@codemirror/view';
import { StateField, StateEffect, RangeSetBuilder, EditorState } from '@codemirror/state';
import type { Extension } from '@codemirror/state';
import { ShikiHighlighter } from './ShikiHighlighter';
import { updateShikiConfig } from './ShikiEditorPlugin';
import type { NodeHover, NodeCompletion, NodeError, NodeQuery } from 'twoslash';
import type { TwoslashShikiReturn } from '@shikijs/twoslash';
import type { BundledLanguage, BundledTheme } from 'shiki';
import { getThemeColors } from '../../utils/themeColors';

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

// Global state for tracking typing activity across all tooltips
const globalTypingState = {
  isTyping: false,
  typingTimeout: null as number | null,
  lastEditTime: Date.now(),
};

// State effect for updating TwoSlash data
const setTwoslashData = StateEffect.define<TwoslashData>();

// State effect for updating theme in decorations
const updateTooltipTheme = StateEffect.define<BundledTheme>();

// State effect for disabling TwoSlash and clearing data
const disableTwoslash = StateEffect.define<void>();

// State effect for re-enabling TwoSlash and triggering analysis
const enableTwoslash = StateEffect.define<void>();

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
      if (effect.is(disableTwoslash)) {
        return {
          hovers: new Map(),
          errors: new Map(),
          queries: new Map(),
          completions: new Map(),
        };
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
        if (effect.is(disableTwoslash)) {
          shouldRebuild = true;
          data = {
            hovers: new Map(),
            errors: new Map(),
            queries: new Map(),
            completions: new Map(),
          };
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
              const dom = createQueryTooltipDOM(
                query.text || '',
                query.docs,
                highlighter,
                language,
                currentTheme,
                tr.state,
              );
              return {
                dom,
                destroy: () => {
                  // Clean up event listeners and observers
                  const container = dom as any;
                  if (container._observer) {
                    container._observer.disconnect();
                  }
                  if (container._editor) {
                    if (container._keyHandler) {
                      container._editor.removeEventListener('keydown', container._keyHandler);
                    }
                    if (container._inputHandler) {
                      container._editor.removeEventListener('input', container._inputHandler);
                    }
                  }
                  // Don't clear global typing timeout as it's shared across tooltips
                },
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
  _editorState?: EditorState,
): HTMLElement {
  // Determine colors based on theme
  let bgColor = '#ffffff';
  let borderColor = '#d1d5db';
  let textColor = '#1f2937';

  if (theme) {
    // Get theme colors asynchronously for better accuracy
    getThemeColors(theme).then((colors) => {
      const elements = document.querySelectorAll('.cm-twoslash-tooltip');
      elements.forEach((el: Element) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.backgroundColor = colors['tooltip.background'];
        htmlEl.style.color = colors['tooltip.foreground'];
        htmlEl.style.border = `1px solid ${colors['tooltip.border']}`;
      });
    });

    // Use basic colors as immediate fallback
    if (highlighter && highlighter.isInitialized()) {
      const basicColors = highlighter.getBasicThemeColors(theme);
      bgColor = basicColors.bg;
      borderColor = basicColors.border;
      textColor = basicColors.fg;
    }
  }

  const shadowColor = highlighter?.isColorDark(bgColor)
    ? 'rgba(0, 0, 0, 0.5)'
    : 'rgba(0, 0, 0, 0.15)';

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
    width: max-content;
    max-width: 500px;
    white-space: pre-wrap;
    word-break: break-word;
    overflow: visible;
    z-index: 1000;
    box-shadow: 0 2px 8px ${shadowColor};
    pointer-events: none;
    transition: opacity 0.2s ease-in-out;
  `;

  const SHOW_DELAY = 3000; // Show tooltip 3 seconds after last edit

  // Set opacity based on focus and typing state using global state
  const updateOpacity = () => {
    const editorElement = document.querySelector('.cm-editor.cm-focused');
    if (!editorElement) {
      // Editor not focused, show tooltip fully
      container.style.opacity = '1';
    } else if (globalTypingState.isTyping) {
      // Editor focused and typing, hide completely
      container.style.opacity = '0';
      container.style.pointerEvents = 'none';
    } else {
      // Editor focused but not typing, show semi-transparent
      container.style.opacity = '0.45';
      container.style.pointerEvents = 'none';
    }
  };

  // Handle keyboard activity with proper debouncing - resets timer on EVERY keystroke
  const handleKeyboard = (event: Event) => {
    const editorElement = document.querySelector('.cm-editor.cm-focused');
    if (!editorElement) return;

    // ANY keystroke hides the tooltip and resets the timer
    if (event instanceof KeyboardEvent) {
      // Hide tooltip immediately on any key press
      globalTypingState.isTyping = true;
      globalTypingState.lastEditTime = Date.now();

      // Update all query tooltips
      document.querySelectorAll('.cm-twoslash-query-tooltip').forEach((el) => {
        (el as HTMLElement).style.opacity = '0';
      });

      // ALWAYS clear and reset the timeout on EVERY keystroke
      if (globalTypingState.typingTimeout !== null) {
        clearTimeout(globalTypingState.typingTimeout);
      }

      // Start a fresh 3-second timer
      globalTypingState.typingTimeout = window.setTimeout(() => {
        globalTypingState.isTyping = false;
        globalTypingState.typingTimeout = null;

        // Update all query tooltips
        document.querySelectorAll('.cm-twoslash-query-tooltip').forEach((el) => {
          const editorEl = document.querySelector('.cm-editor.cm-focused');
          (el as HTMLElement).style.opacity = editorEl ? '0.45' : '1';
        });
      }, SHOW_DELAY);
    }
  };

  // Set initial opacity
  updateOpacity();

  // Watch for focus changes on the editor
  const observer = new MutationObserver(() => {
    // Reset typing state when focus changes
    if (!document.querySelector('.cm-editor.cm-focused')) {
      globalTypingState.isTyping = false;
      if (globalTypingState.typingTimeout !== null) {
        clearTimeout(globalTypingState.typingTimeout);
        globalTypingState.typingTimeout = null;
      }
    }
    updateOpacity();
  });

  // Find the editor element and set up listeners
  setTimeout(() => {
    const editor = container.closest('.cm-editor');
    if (editor) {
      // Observe class changes for focus detection
      observer.observe(editor, {
        attributes: true,
        attributeFilter: ['class'],
      });

      // Add keyboard event listener to detect typing
      editor.addEventListener('keydown', handleKeyboard);

      // Add input event listener to catch paste, cut, and other input events
      const handleInput = () => {
        globalTypingState.isTyping = true;
        globalTypingState.lastEditTime = Date.now();

        // Update all query tooltips
        document.querySelectorAll('.cm-twoslash-query-tooltip').forEach((el) => {
          (el as HTMLElement).style.opacity = '0';
        });

        // ALWAYS clear and reset the timeout on every input event
        if (globalTypingState.typingTimeout !== null) {
          clearTimeout(globalTypingState.typingTimeout);
        }

        // Start a fresh 3-second timer
        globalTypingState.typingTimeout = window.setTimeout(() => {
          globalTypingState.isTyping = false;
          globalTypingState.typingTimeout = null;

          // Update all query tooltips
          document.querySelectorAll('.cm-twoslash-query-tooltip').forEach((el) => {
            const editorEl = document.querySelector('.cm-editor.cm-focused');
            (el as HTMLElement).style.opacity = editorEl ? '0.45' : '1';
          });
        }, SHOW_DELAY);
      };

      editor.addEventListener('input', handleInput);

      // Store references for cleanup
      (container as any)._observer = observer;
      (container as any)._keyHandler = handleKeyboard;
      (container as any)._inputHandler = handleInput;
      (container as any)._editor = editor;
    }
  }, 0);

  // Add type info
  const typeDiv = document.createElement('div');
  typeDiv.className = 'cm-twoslash-type-content';
  typeDiv.style.cssText = `
    white-space: pre-wrap;
    word-break: break-word;
    overflow-wrap: break-word;
    max-width: 100%;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    line-height: 1.4;
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
    const docsColor = highlighter?.isColorDark(bgColor) ? '#9cdcfe' : '#0969da';
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
      // Render ALL lines, not just the first one!
      const renderedLines = tokens.map((line) => highlighter.renderTokensToHtml(line.tokens));
      // Join lines with newlines to preserve multiline structure
      return renderedLines.join('\n');
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
  private config: TwoslashTooltipConfig;
  private updateTimeout: number | null = null;
  private lastContent: string = '';
  decorations: DecorationSet = Decoration.none;

  constructor(view: EditorView, config: TwoslashTooltipConfig) {
    this.view = view;
    this.config = config;
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
        if (effect.is(enableTwoslash)) {
          // Force re-analysis when TwoSlash is re-enabled
          this.lastContent = ''; // Force re-analysis
          this.scheduleUpdate();
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

    // Debounce updates for performance with configurable delay
    // Use longer delay (500ms) for TwoSlash analysis to reduce computation
    // Note: Syntax highlighting happens separately in ShikiEditorPlugin with 50ms delay
    const delay = this.config?.delay || 500;
    this.updateTimeout = window.setTimeout(() => {
      this.updateTwoslashData();
      this.updateTimeout = null;
    }, delay);
  }

  private async updateTwoslashData() {
    const content = this.view.state.doc.toString();

    // Skip if content hasn't changed
    if (content === this.lastContent) {
      return;
    }

    this.lastContent = content;

    if (!content) {
      // Clear TwoSlash data when content is empty
      const emptyData: TwoslashData = {
        hovers: new Map(),
        errors: new Map(),
        queries: new Map(),
        completions: new Map(),
      };
      this.view.dispatch({
        effects: setTwoslashData.of(emptyData),
      });
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
    const result = await this.highlighter.highlightWithTwoslash(content, this.language, this.theme);

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
          let bgColor = '#ffffff';
          let borderColor = '#d1d5db';
          let textColor = '#1f2937';

          // Use async to get theme colors, but apply them when available
          if (currentTheme) {
            getThemeColors(currentTheme)
              .then((colors) => {
                dom.style.backgroundColor = colors['tooltip.background'];
                dom.style.color = colors['tooltip.foreground'];
                dom.style.border = `1px solid ${colors['tooltip.border']}`;
              })
              .catch(() => {
                // Fallback already applied
              });

            // Apply basic colors synchronously as fallback
            if (config.highlighter && config.highlighter.isInitialized()) {
              const basicColors = config.highlighter.getBasicThemeColors(currentTheme);
              bgColor = basicColors.bg;
              borderColor = basicColors.border;
              textColor = basicColors.fg;
            }
          }

          // Apply styles
          dom.style.padding = '8px 12px';
          dom.style.borderRadius = '6px';
          dom.style.backgroundColor = bgColor;
          dom.style.color = textColor;
          dom.style.border = `1px solid ${borderColor}`;
          dom.style.fontSize = '13px';
          dom.style.width = 'max-content';
          dom.style.minWidth = '150px';
          dom.style.maxWidth = '500px';
          dom.style.whiteSpace = 'pre-wrap';
          dom.style.wordBreak = 'break-word';
          dom.style.lineHeight = '1.4';

          // Style error tooltips differently
          const errorTooltip = dom.querySelector('.twoslash-error-tooltip');
          if (errorTooltip) {
            (errorTooltip as HTMLElement).style.borderLeft = '3px solid #f14c4c';
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
              style: 'text-decoration: underline wavy #f14c4c; text-underline-offset: 3px;',
            },
          });
          builder.add(start, start + error.length, decoration);
        }

        return builder.finish();
      }
      if (effect.is(disableTwoslash)) {
        // Clear all decorations when TwoSlash is disabled
        return Decoration.none;
      }
    }

    return decorations.map(tr.changes);
  },
  provide: (f) => EditorView.decorations.from(f),
});

// Function to update tooltip arrow styles based on theme
function updateTooltipArrowStyles(theme: BundledTheme, highlighter?: ShikiHighlighter) {
  let borderColor = '#d1d5db';
  let bgColor = '#ffffff';

  // Get theme colors asynchronously for better accuracy
  getThemeColors(theme).then((colors) => {
    borderColor = colors['tooltip.border'];
    bgColor = colors['tooltip.background'];

    // Update the style element with new colors
    const styleContent = `
      .cm-tooltip-arrow:before {
        border-color: transparent transparent ${borderColor} transparent !important;
      }
      .cm-tooltip-arrow:after {
        border-color: transparent transparent ${bgColor} transparent !important;
      }
      .cm-tooltip-above .cm-tooltip-arrow:before {
        border-color: ${borderColor} transparent transparent transparent !important;
      }
      .cm-tooltip-above .cm-tooltip-arrow:after {
        border-color: ${bgColor} transparent transparent transparent !important;
      }
    `;

    let styleElement = document.getElementById('twoslash-tooltip-arrow-styles') as HTMLStyleElement;
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'twoslash-tooltip-arrow-styles';
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = styleContent;
  });

  // Use basic colors as immediate fallback
  if (highlighter && highlighter.isInitialized()) {
    const basicColors = highlighter.getBasicThemeColors(theme);
    borderColor = basicColors.border;
    bgColor = basicColors.bg;
  }

  // Remove existing style element if it exists
  const existingStyle = document.getElementById('twoslash-tooltip-arrow-styles');
  if (existingStyle) {
    existingStyle.remove();
  }

  // Create new style element with theme-appropriate arrow colors
  const style = document.createElement('style');
  style.id = 'twoslash-tooltip-arrow-styles';
  style.textContent = `
    .cm-tooltip-arrow:before {
      border-top-color: ${borderColor} !important;
    }
    .cm-tooltip-arrow:after {
      border-top-color: ${bgColor} !important;
    }
    .cm-tooltip.cm-tooltip-below .cm-tooltip-arrow:before {
      border-bottom-color: ${borderColor} !important;
      border-top-color: transparent !important;
    }
    .cm-tooltip.cm-tooltip-below .cm-tooltip-arrow:after {
      border-bottom-color: ${bgColor} !important;
      border-top-color: transparent !important;
    }
  `;
  document.head.appendChild(style);
}

// Export the disable and enable effects for external use
export const clearTwoslashData = disableTwoslash;
export const enableTwoslashData = enableTwoslash;

// Main plugin export
export function twoslashTooltipPlugin(config: TwoslashTooltipConfig = {}): Extension[] {
  const queryTooltipsField = createQueryTooltipsField(
    config.highlighter,
    config.language,
    config.theme,
  );

  // Initialize arrow styles with the current theme
  if (config.theme) {
    updateTooltipArrowStyles(config.theme, config.highlighter);
  }

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
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      },
      '.cm-twoslash-type-content span': {
        whiteSpace: 'inherit',
      },
    }),
    // Add dynamic theme-based tooltip arrow styles
    StateField.define({
      create() {
        return null;
      },
      update(value, tr) {
        // Listen for theme changes and update arrow styles
        for (const effect of tr.effects) {
          if (effect.is(updateTooltipTheme) || effect.is(updateShikiConfig)) {
            const theme = effect.is(updateTooltipTheme) ? effect.value : effect.value.theme;
            if (theme) {
              updateTooltipArrowStyles(theme, config.highlighter);
            }
          }
        }
        return value;
      },
    }),
  ];
}

// Helper to create the complete TwoSlash extension
async function createTwoslashExtension(
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
