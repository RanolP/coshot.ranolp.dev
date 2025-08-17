import type { Component } from 'solid-js';
import { createSignal, onCleanup, onMount } from 'solid-js';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { autocompletion } from '@codemirror/autocomplete';
import { search } from '@codemirror/search';
import { lintGutter } from '@codemirror/lint';

interface CodeMirrorWidgetProps {
  value?: string;
  language?: 'javascript' | 'html' | 'css' | 'jsx' | 'tsx';
  theme?: 'light' | 'dark';
  height?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
}

const CodeMirrorWidget: Component<CodeMirrorWidgetProps> = (props) => {
  let editorRef: HTMLDivElement | undefined;
  let editorView: EditorView | undefined;
  const [isReady, setIsReady] = createSignal(false);

  const getLanguageSupport = () => {
    switch (props.language) {
      case 'javascript':
      case 'jsx':
        return javascript({ jsx: props.language === 'jsx' });
      case 'tsx':
        return javascript({ jsx: true, typescript: true });
      case 'html':
        return html();
      case 'css':
        return css();
      default:
        return javascript();
    }
  };

  const getTheme = () => {
    return props.theme === 'dark' ? 'dark' : 'light';
  };

  const createEditor = () => {
    if (!editorRef) return;

    const extensions = [
      basicSetup,
      getLanguageSupport(),
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
          height: props.height || '300px',
          borderRadius: '8px',
          overflow: 'hidden',
        },
        '.cm-scroller': {
          fontFamily:
            'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
        },
        '.cm-content': {
          padding: '12px',
          caretColor: props.theme === 'dark' ? '#fff' : '#000',
        },
        '.cm-line': {
          lineHeight: '1.6',
        },
        '.cm-gutters': {
          backgroundColor: props.theme === 'dark' ? '#1e1e1e' : '#f8f9fa',
          borderRight: `1px solid ${
            props.theme === 'dark' ? '#404040' : '#e9ecef'
          }`,
          color: props.theme === 'dark' ? '#858585' : '#6c757d',
        },
        '.cm-activeLineGutter': {
          backgroundColor: props.theme === 'dark' ? '#2d2d2d' : '#e9ecef',
        },
        '.cm-activeLine': {
          backgroundColor: props.theme === 'dark' ? '#2d2d2d' : '#f8f9fa',
        },
        '.cm-selectionBackground': {
          backgroundColor: props.theme === 'dark' ? '#264f78' : '#b3d4fc',
        },
        '.cm-cursor': {
          borderLeft: `2px solid ${props.theme === 'dark' ? '#fff' : '#000'}`,
        },
        '.cm-tooltip': {
          backgroundColor: props.theme === 'dark' ? '#2d2d2d' : '#fff',
          border: `1px solid ${props.theme === 'dark' ? '#404040' : '#e9ecef'}`,
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
            backgroundColor: props.theme === 'dark' ? '#264f78' : '#007bff',
            color: props.theme === 'dark' ? '#fff' : '#fff',
          },
        },
        '.cm-searchMatch': {
          backgroundColor: props.theme === 'dark' ? '#ffd700' : '#ffeb3b',
          color: props.theme === 'dark' ? '#000' : '#000',
        },
        '.cm-searchMatch.cm-searchMatch-selected': {
          backgroundColor: props.theme === 'dark' ? '#ff6b6b' : '#ff5722',
          color: props.theme === 'dark' ? '#fff' : '#fff',
        },
      }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged && props.onChange) {
          props.onChange(update.state.doc.toString());
        }
      }),
    ];

    if (props.readOnly) {
      extensions.push(EditorView.editable.of(false));
    }

    editorView = new EditorView({
      doc: props.value || props.placeholder || '',
      extensions,
      parent: editorRef,
    });

    setIsReady(true);
  };

  onMount(() => {
    createEditor();
  });

  onCleanup(() => {
    if (editorView) {
      editorView.destroy();
    }
  });

  // Update editor content when value prop changes
  const updateContent = (newValue: string) => {
    if (editorView && newValue !== editorView.state.doc.toString()) {
      editorView.dispatch({
        changes: {
          from: 0,
          to: editorView.state.doc.length,
          insert: newValue,
        },
      });
    }
  };

  // Expose methods for external use
  const getValue = () => {
    return editorView?.state.doc.toString() || '';
  };

  const setValue = (value: string) => {
    updateContent(value);
  };

  const focus = () => {
    editorView?.focus();
  };

  const searchInEditor = (query: string) => {
    if (editorView) {
      // Search functionality is handled by the search extension
      // Users can use Ctrl+F to open search panel
      // Or programmatically set search query
      editorView.focus();
    }
  };

  // Expose editor methods for external use
  const getEditorView = () => editorView;

  return (
    <div class={`codemirror-widget ${props.className || ''}`}>
      <div
        ref={editorRef}
        class="editor-container"
        style={{
          'border-radius': '8px',
          overflow: 'hidden',
          border: `1px solid ${props.theme === 'dark' ? '#404040' : '#e9ecef'}`,
        }}
      />
      {isReady() && (
        <div
          class="editor-toolbar"
          style={{
            display: 'flex',
            gap: '8px',
            padding: '8px',
            background: props.theme === 'dark' ? '#1e1e1e' : '#f8f9fa',
            'border-top': `1px solid ${
              props.theme === 'dark' ? '#404040' : '#e9ecef'
            }`,
            'border-radius': '0 0 8px 8px',
          }}
        >
          <button
            onClick={() => focus()}
            style={{
              padding: '4px 8px',
              background: props.theme === 'dark' ? '#404040' : '#e9ecef',
              border: 'none',
              'border-radius': '4px',
              color: props.theme === 'dark' ? '#fff' : '#000',
              cursor: 'pointer',
              'font-size': '12px',
            }}
          >
            Focus
          </button>
          <span
            style={{
              color: props.theme === 'dark' ? '#858585' : '#6c757d',
              'font-size': '12px',
              'margin-left': 'auto',
            }}
          >
            {props.language?.toUpperCase() || 'TEXT'}
          </span>
        </div>
      )}
    </div>
  );
};

export default CodeMirrorWidget;
