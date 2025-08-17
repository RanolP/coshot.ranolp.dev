import type { Component } from 'solid-js';
import { createSignal, onCleanup, onMount, createEffect } from 'solid-js';
import { EditorView, basicSetup } from 'codemirror';
import { autocompletion } from '@codemirror/autocomplete';
import { search } from '@codemirror/search';
import { lintGutter } from '@codemirror/lint';
import type { Extension } from '@codemirror/state';
import type { BundledLanguage, BundledTheme } from 'shiki';
import { shikiEditorPlugin, updateShikiConfig } from './ShikiEditorPlugin';
import { twoslashTooltipPlugin, clearTwoslashData, enableTwoslashData } from './TwoslashTooltipPlugin';
import { ShikiHighlighter } from './ShikiHighlighter';

interface ShikiCodeMirrorWidgetProps {
  value?: string;
  language?: BundledLanguage;
  theme?: BundledTheme;
  height?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
  enableTwoslash?: boolean;
}

const ShikiCodeMirrorWidget: Component<ShikiCodeMirrorWidgetProps> = (
  props,
) => {
  let editorRef: HTMLDivElement | undefined;
  let highlighterInstance: ShikiHighlighter | undefined;
  let previousTwoslashEnabled = false;
  const [editorView, setEditorView] = createSignal<EditorView | undefined>(
    undefined,
  );
  const [isReady, setIsReady] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(true);

  const createEditor = async () => {
    if (!editorRef) return;

    setIsLoading(true);

    try {
      // Create and initialize shared highlighter instance
      highlighterInstance = new ShikiHighlighter({
        themes: ['github-light', 'github-dark'],
        langs: ['javascript', 'typescript', 'tsx', 'jsx', 'css', 'html'],
      });
      await highlighterInstance.initialize();
      const extensions: Extension[] = [
        basicSetup,
        autocompletion(),
        search(),
        lintGutter(),
        EditorView.theme({
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
          '.cm-tooltip': {
            backgroundColor: props.theme === 'github-dark' ? '#2d2d2d' : '#fff',
            border: `1px solid ${
              props.theme === 'github-dark' ? '#404040' : '#e9ecef'
            }`,
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
              backgroundColor:
                props.theme === 'github-dark' ? '#264f78' : '#007bff',
              color: '#fff',
            },
          },
          '.cm-searchMatch': {
            backgroundColor:
              props.theme === 'github-dark' ? '#ffd700' : '#ffeb3b',
            color: '#000',
          },
          '.cm-searchMatch.cm-searchMatch-selected': {
            backgroundColor:
              props.theme === 'github-dark' ? '#ff6b6b' : '#ff5722',
            color: '#fff',
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
            backgroundColor: props.theme === 'github-dark' ? '#1e1e1e' : '#fff',
            color: props.theme === 'github-dark' ? '#d4d4d4' : '#333',
            border: `1px solid ${
              props.theme === 'github-dark' ? '#454545' : '#e9ecef'
            }`,
            fontSize: '13px',
            maxWidth: '500px',
            lineHeight: '1.4',
          },
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && props.onChange) {
            props.onChange(update.state.doc.toString());
          }
        }),
      ];

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
    if (view && props.theme) {
      view.dispatch({
        effects: updateShikiConfig.of({ theme: props.theme }),
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
      ['typescript', 'tsx', 'javascript', 'jsx'].includes(props.language)
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
    <div class={`shiki-codemirror-widget ${props.className || ''}`}>
      {isLoading() && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: props.theme === 'github-dark' ? '#858585' : '#6c757d',
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
          'border-radius': '8px',
          overflow: 'hidden',
          border: `1px solid ${
            props.theme === 'github-dark' ? '#404040' : '#e9ecef'
          }`,
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
            background: props.theme === 'github-dark' ? '#1e1e1e' : '#f8f9fa',
            'border-top': `1px solid ${
              props.theme === 'github-dark' ? '#404040' : '#e9ecef'
            }`,
            'border-radius': '0 0 8px 8px',
            'margin-top': '-1px',
          }}
        >
          <span
            style={{
              color: props.theme === 'github-dark' ? '#858585' : '#6c757d',
              'font-size': '12px',
              'margin-left': 'auto',
              display: 'flex',
              'align-items': 'center',
              gap: '8px',
            }}
          >
            {props.language?.toUpperCase() || 'TEXT'}
            {props.enableTwoslash &&
              props.language &&
              ['typescript', 'tsx', 'javascript', 'jsx'].includes(
                props.language,
              ) && (
                <span
                  style={{
                    padding: '2px 6px',
                    background:
                      props.theme === 'github-dark' ? '#264f78' : '#007bff',
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
