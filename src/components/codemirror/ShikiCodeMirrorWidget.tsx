import type { Component } from 'solid-js';
import { createSignal, onCleanup, onMount, createEffect } from 'solid-js';
import { EditorView } from 'codemirror';
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { bracketMatching, defaultHighlightStyle, foldGutter, foldKeymap, indentOnInput, syntaxHighlighting } from '@codemirror/language';
import { lintGutter, lintKeymap } from '@codemirror/lint';
import type { Extension } from '@codemirror/state';
import { Compartment, EditorState } from '@codemirror/state';
import { drawSelection, dropCursor, highlightActiveLine, highlightActiveLineGutter, highlightSpecialChars, keymap, lineNumbers, rectangularSelection } from '@codemirror/view';
import type { BundledLanguage, BundledTheme } from 'shiki';
import { shikiEditorPlugin, updateShikiConfig } from './ShikiEditorPlugin';
import SearchableThemeSelector from '../SearchableThemeSelector';
import SearchableLanguageSelector from '../SearchableLanguageSelector';
import TwoslashToggle from '../TwoslashToggle';
import {
  twoslashTooltipPlugin,
  clearTwoslashData,
  enableTwoslashData,
} from './TwoslashTooltipPlugin';
import { ShikiHighlighter } from './ShikiHighlighter';
import { languageDisplayNames } from '../../utils/languageNames';

// All available Shiki themes
const AVAILABLE_THEMES: BundledTheme[] = [
  'andromeeda',
  'aurora-x',
  'ayu-dark',
  'catppuccin-frappe',
  'catppuccin-latte',
  'catppuccin-macchiato',
  'catppuccin-mocha',
  'dark-plus',
  'dracula',
  'dracula-soft',
  'everforest-dark',
  'everforest-light',
  'github-dark',
  'github-dark-default',
  'github-dark-dimmed',
  'github-dark-high-contrast',
  'github-light',
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
  'kanagawa-lotus',
  'kanagawa-wave',
  'laserwave',
  'light-plus',
  'material-theme',
  'material-theme-darker',
  'material-theme-lighter',
  'material-theme-ocean',
  'material-theme-palenight',
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

interface ShikiCodeMirrorWidgetProps {
  value?: string;
  language?: BundledLanguage;
  theme?: BundledTheme;
  height?: string;
  onChange?: (value: string) => void;
  onThemeChange?: (theme: BundledTheme) => void;
  onLanguageChange?: (language: BundledLanguage) => void;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
  enableTwoslash?: boolean;
  showThemeSelector?: boolean;
  showLanguageSelector?: boolean;
  showTwoslashToggle?: boolean;
  onTwoslashToggle?: (enabled: boolean) => void;
  lineWrapping?: boolean;
}

const ShikiCodeMirrorWidget: Component<ShikiCodeMirrorWidgetProps> = (
  props,
) => {
  let editorRef: HTMLDivElement | undefined;
  let highlighterInstance: ShikiHighlighter | undefined;
  let previousTwoslashEnabled = false;
  let themeCompartment: Compartment | undefined;
  const [editorView, setEditorView] = createSignal<EditorView | undefined>(
    undefined,
  );
  const [isReady, setIsReady] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(true);
  const [themeColors, setThemeColors] = createSignal<{
    bg: string;
    fg: string;
    border: string;
    selection?: string;
    activeLineHighlight?: string;
  }>({
    bg: '#ffffff',
    fg: '#000000',
    border: '#e1e4e8',
  });

  const updateThemeColors = () => {
    if (
      highlighterInstance &&
      highlighterInstance.isInitialized() &&
      props.theme
    ) {
      const colors = highlighterInstance.getBasicThemeColors(props.theme);
      setThemeColors(colors);
    }
  };

  const createThemeExtension = () => {
    const colors = themeColors();
    // Use actual theme colors, not heuristics
    const selectionBg = colors.selection || 'rgba(0, 123, 255, 0.25)';

    return EditorView.theme({
      '&': {
        fontSize: '14px',
        fontFamily:
          'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
      },
      '.cm-editor': {
        height: props.height || '400px',
        minWidth: '480px',
        borderRadius: '8px',
        overflow: 'hidden',
      },
      '.cm-scroller': {
        fontFamily:
          'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
      },
      '.cm-content': {
        padding: '12px',
      },
      '.cm-line': {
        lineHeight: '1.6',
      },
      // Selection styling - comprehensive coverage with higher specificity
      '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
        backgroundColor: `${selectionBg} !important`,
      },
      '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground':
        {
          backgroundColor: `${selectionBg} !important`,
        },
      '.cm-content ::selection': {
        backgroundColor: `${selectionBg} !important`,
      },
      // Ensure selection is visible even when not focused
      '& .cm-selectionBackground': {
        backgroundColor: `${selectionBg} !important`,
      },
      // Make sure selection layer is above text decorations
      '.cm-selectionLayer': {
        zIndex: '1 !important',
      },
      '.cm-tooltip': {
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      '.cm-tooltip.cm-tooltip-autocomplete': {
        '& > ul': {
          maxHeight: '200px',
          overflowY: 'auto',
        },
        '& > ul > li': {
          padding: '4px 8px',
          cursor: 'pointer',
        },
        '& > ul > li[aria-selected]': {
          backgroundColor: colors.selection || '#007bff',
          color: '#fff',
        },
      },
      // Shiki token styles
      '.shiki-token': {
        transition: 'color 0.1s',
      },
      // TwoSlash error styles
      '.cm-twoslash-error': {
        textDecoration: 'underline wavy #f14c4c',
        textUnderlineOffset: '3px',
      },
      // TwoSlash tooltip styles
      '.cm-twoslash-tooltip': {
        padding: '8px 12px',
        borderRadius: '6px',
        backgroundColor: colors.bg,
        color: colors.fg,
        border: `1px solid ${colors.border}`,
        fontSize: '13px',
        maxWidth: '500px',
        lineHeight: '1.4',
      },
    });
  };

  const createEditor = async () => {
    if (!editorRef) return;

    setIsLoading(true);

    try {
      // Create and initialize shared highlighter instance
      highlighterInstance = new ShikiHighlighter({
        themes: AVAILABLE_THEMES,
        langs: ['javascript', 'typescript', 'tsx', 'jsx', 'css', 'html'],
      });
      await highlighterInstance.initialize();

      // Update theme colors after initialization
      updateThemeColors();

      // Create theme compartment for dynamic updates
      themeCompartment = new Compartment();

      const extensions: Extension[] = [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        foldGutter(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        rectangularSelection(),
        highlightActiveLine(),
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...historyKeymap,
          ...foldKeymap,
          ...completionKeymap,
          ...lintKeymap,
          indentWithTab
        ]),
        lintGutter(),
        themeCompartment.of(createThemeExtension()),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && props.onChange) {
            props.onChange(update.state.doc.toString());
          }
        }),
      ];
      
      // Add line wrapping if specified
      if (props.lineWrapping) {
        extensions.push(EditorView.lineWrapping);
      }

      // Add Shiki highlighting
      const shikiExtensions = shikiEditorPlugin({
        language: props.language || 'javascript',
        theme: props.theme || 'github-light',
        highlighter: highlighterInstance,
      });
      extensions.push(...shikiExtensions);

      // Add TwoSlash support if enabled and language supports it
      if (
        props.enableTwoslash &&
        props.language &&
        ['typescript', 'tsx', 'javascript', 'jsx'].includes(props.language)
      ) {
        const twoslashExtensions = twoslashTooltipPlugin({
          highlighter: highlighterInstance,
          language: props.language,
          theme: props.theme,
          delay: 150,
        });
        extensions.push(...twoslashExtensions);
      }

      if (props.readOnly) {
        extensions.push(EditorView.editable.of(false));
      }

      const view = new EditorView({
        doc: props.value || props.placeholder || '',
        extensions,
        parent: editorRef,
      });
      setEditorView(view);

      setIsReady(true);
    } catch (error) {
      console.error('Error creating editor:', error);
    } finally {
      setIsLoading(false);
    }
  };

  onMount(() => {
    createEditor();
  });

  onCleanup(async () => {
    const view = editorView();
    if (view) {
      view.destroy();
    }
    if (highlighterInstance) {
      await highlighterInstance.dispose();
    }
  });

  // Update editor content when value prop changes
  createEffect(() => {
    const newValue = props.value || '';
    const view = editorView();
    if (view && newValue !== view.state.doc.toString()) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: newValue,
        },
      });
    }
  });

  // Update theme when prop changes
  createEffect(() => {
    const view = editorView();
    if (view && props.theme && highlighterInstance && themeCompartment) {
      // Update theme colors first
      updateThemeColors();

      // Update shiki config
      view.dispatch({
        effects: updateShikiConfig.of({ theme: props.theme }),
      });

      // Update the theme extension using compartment
      view.dispatch({
        effects: themeCompartment.reconfigure(createThemeExtension()),
      });
    }
  });

  // Update language when prop changes
  createEffect(() => {
    const view = editorView();
    if (view && props.language) {
      view.dispatch({
        effects: updateShikiConfig.of({ language: props.language }),
      });
    }
  });

  // Track TwoSlash state changes and clear data when disabled
  createEffect(() => {
    const view = editorView();
    const isTwoslashEnabled = Boolean(
      props.enableTwoslash &&
        props.language &&
        ['typescript', 'tsx', 'javascript', 'jsx'].includes(props.language),
    );

    if (view) {
      if (previousTwoslashEnabled && !isTwoslashEnabled) {
        // TwoSlash was enabled but now disabled, clear all data
        view.dispatch({
          effects: clearTwoslashData.of(undefined),
        });
      } else if (!previousTwoslashEnabled && isTwoslashEnabled) {
        // TwoSlash was disabled but now enabled, trigger re-analysis
        view.dispatch({
          effects: enableTwoslashData.of(undefined),
        });
      }
    }

    previousTwoslashEnabled = isTwoslashEnabled;
  });

  return (
    <div class={`shiki-codemirror-widget ${props.className || ''}`}
      style={{
        display: 'flex',
        'flex-direction': 'column',
        height: '100%',
        position: 'relative',
        'min-height': props.height || '400px',
      }}
    >
      {isLoading() && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            'flex-direction': 'column',
            'align-items': 'center',
            gap: '16px',
            'z-index': '10',
          }}
        >
          <div
            class="loading-spinner"
            style={{
              width: '40px',
              height: '40px',
              border: `3px solid ${themeColors().border}`,
              'border-top-color': themeColors().fg,
              'border-radius': '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <div
            style={{
              color: themeColors().fg,
              'font-size': '14px',
              opacity: '0.8',
              'font-family': 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
            }}
          >
            Initializing editor...
          </div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
      <div
        ref={editorRef}
        class="editor-container"
        style={{
          flex: '1',
          'border-radius': '8px',
          overflow: 'hidden',
          opacity: isLoading() ? '0.3' : '1',
          filter: isLoading() ? 'blur(2px)' : 'none',
          transition: 'opacity 0.3s ease, filter 0.3s ease',
          'pointer-events': isLoading() ? 'none' : 'auto',
        }}
      />
      {isReady() && (
        <div
          class="editor-toolbar"
          style={{
            display: 'flex',
            gap: '8px',
            padding: '8px',
            background: themeColors().bg,
            'border-radius': '8px',
            'margin-top': '8px',
            'flex-shrink': '0',
          }}
        >
          {props.showThemeSelector && (
            <SearchableThemeSelector
              value={props.theme || 'github-light'}
              onChange={(theme) => props.onThemeChange?.(theme)}
            />
          )}
          {props.showLanguageSelector && (
            <SearchableLanguageSelector
              value={props.language || 'javascript'}
              onChange={(language) => props.onLanguageChange?.(language)}
            />
          )}
          {props.showTwoslashToggle && (
            <TwoslashToggle
              enabled={props.enableTwoslash || false}
              language={props.language || 'javascript'}
              onToggle={(enabled) => props.onTwoslashToggle?.(enabled)}
              colors={{
                foreground: themeColors().fg,
                background: themeColors().bg,
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ShikiCodeMirrorWidget;
