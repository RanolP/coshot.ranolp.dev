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
import {
  twoslashTooltipPlugin,
  clearTwoslashData,
  enableTwoslashData,
} from './TwoslashTooltipPlugin';
import { ShikiHighlighter } from './ShikiHighlighter';

// Language display names mapping
const languageDisplayNames: Record<string, string> = {
  // Web Languages
  'html': 'HTML',
  'css': 'CSS',
  'scss': 'SCSS',
  'sass': 'Sass',
  'less': 'Less',
  'stylus': 'Stylus',
  
  // JavaScript & TypeScript
  'javascript': 'JavaScript',
  'typescript': 'TypeScript',
  'jsx': 'JSX',
  'tsx': 'TSX',
  'json': 'JSON',
  'jsonc': 'JSON with Comments',
  
  // Web Frameworks
  'vue': 'Vue',
  'svelte': 'Svelte',
  'astro': 'Astro',
  'angular-html': 'Angular HTML',
  'angular-ts': 'Angular TypeScript',
  
  // Programming Languages
  'python': 'Python',
  'java': 'Java',
  'cpp': 'C++',
  'c': 'C',
  'csharp': 'C#',
  'go': 'Go',
  'rust': 'Rust',
  'kotlin': 'Kotlin',
  'swift': 'Swift',
  'objective-c': 'Objective-C',
  'scala': 'Scala',
  'ruby': 'Ruby',
  'php': 'PHP',
  'perl': 'Perl',
  'lua': 'Lua',
  'dart': 'Dart',
  'julia': 'Julia',
  'r': 'R',
  'matlab': 'MATLAB',
  'fortran-free-form': 'Fortran',
  'ada': 'Ada',
  'pascal': 'Pascal',
  'd': 'D',
  'nim': 'Nim',
  'crystal': 'Crystal',
  'zig': 'Zig',
  'v': 'V',
  
  // Functional Languages
  'haskell': 'Haskell',
  'elm': 'Elm',
  'fsharp': 'F#',
  'ocaml': 'OCaml',
  'scheme': 'Scheme',
  'racket': 'Racket',
  'clojure': 'Clojure',
  'elixir': 'Elixir',
  'erlang': 'Erlang',
  'lisp': 'Lisp',
  'purescript': 'PureScript',
  'rescript': 'ReScript',
  
  // Shell & Scripts
  'bash': 'Bash',
  'shell': 'Shell',
  'powershell': 'PowerShell',
  'fish': 'Fish',
  'zsh': 'Zsh',
  'bat': 'Batch',
  'makefile': 'Makefile',
  'cmake': 'CMake',
  
  // Data & Config
  'sql': 'SQL',
  'graphql': 'GraphQL',
  'prisma': 'Prisma',
  'yaml': 'YAML',
  'toml': 'TOML',
  'xml': 'XML',
  'csv': 'CSV',
  'ini': 'INI',
  'properties': 'Properties',
  'dotenv': 'DotEnv',
  
  // Documentation
  'markdown': 'Markdown',
  'mdx': 'MDX',
  'latex': 'LaTeX',
  'asciidoc': 'AsciiDoc',
  'rst': 'reStructuredText',
  
  // DevOps & Cloud
  'dockerfile': 'Dockerfile',
  'docker': 'Docker Compose',
  'kubernetes': 'Kubernetes',
  'terraform': 'Terraform',
  'nginx': 'Nginx',
  'apache': 'Apache',
  
  // Smart Contracts
  'solidity': 'Solidity',
  'vyper': 'Vyper',
  'move': 'Move',
  'cairo': 'Cairo',
  
  // Low Level
  'asm': 'Assembly',
  'wasm': 'WebAssembly',
  'llvm': 'LLVM IR',
  'cuda': 'CUDA',
  'glsl': 'GLSL',
  'hlsl': 'HLSL',
  'wgsl': 'WGSL',
  
  // Other
  'vim': 'Vim Script',
  'emacs-lisp': 'Emacs Lisp',
  'regex': 'Regular Expression',
  'diff': 'Diff',
  'git-commit': 'Git Commit',
  'git-rebase': 'Git Rebase',
  'ssh-config': 'SSH Config',
  'proto': 'Protocol Buffers',
};

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
      }}
    >
      {isLoading() && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: themeColors().fg,
            'font-size': '14px',
          }}
        >
          Loading Shiki highlighter...
        </div>
      )}
      <div
        ref={editorRef}
        class="editor-container"
        style={{
          flex: '1',
          'border-radius': '8px',
          overflow: 'hidden',
          opacity: isLoading() ? '0.5' : '1',
          transition: 'opacity 0.3s',
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
          {props.showLanguageSelector && (
            <SearchableLanguageSelector
              value={props.language || 'javascript'}
              onChange={(language) => props.onLanguageChange?.(language)}
            />
          )}
          {props.showThemeSelector && (
            <SearchableThemeSelector
              value={props.theme || 'github-light'}
              onChange={(theme) => props.onThemeChange?.(theme)}
            />
          )}
          <span
            style={{
              color: themeColors().fg,
              'font-size': '12px',
              'margin-left': 'auto',
              display: 'flex',
              'align-items': 'center',
              gap: '8px',
            }}
          >
            {props.language ? (languageDisplayNames[props.language] || props.language) : 'Text'}
            {props.enableTwoslash &&
              props.language &&
              ['typescript', 'tsx', 'javascript', 'jsx'].includes(
                props.language,
              ) && (
                <span
                  style={{
                    padding: '2px 6px',
                    background: themeColors().selection || '#007bff',
                    color: '#fff',
                    'border-radius': '3px',
                    'font-size': '10px',
                    'font-weight': 'bold',
                  }}
                >
                  TwoSlash
                </span>
              )}
          </span>
        </div>
      )}
    </div>
  );
};

export default ShikiCodeMirrorWidget;
