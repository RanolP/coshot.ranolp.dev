import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import CodeMirrorWidget from './CodeMirrorWidget';

const SimpleCodeMirrorExample: Component = () => {
  const [code, setCode] = createSignal(`// Simple CodeMirror Example
function hello() {
  console.log("Hello, CodeMirror!");
  return "Success!";
}

hello();`);

  return (
    <div
      style={{
        padding: '2rem',
        'max-width': '800px',
        margin: '0 auto',
        'font-family': 'system-ui, sans-serif',
      }}
    >
      <h1
        style={{
          color: '#333',
          'margin-bottom': '1rem',
        }}
      >
        Simple CodeMirror Widget Example
      </h1>

      <p
        style={{
          color: '#666',
          'margin-bottom': '2rem',
        }}
      >
        This is a basic example of the CodeMirror widget. Try editing the code
        below!
      </p>

      <div
        style={{
          'margin-bottom': '2rem',
        }}
      >
        <h3
          style={{
            color: '#333',
            'margin-bottom': '0.5rem',
          }}
        >
          JavaScript Editor
        </h3>
        <CodeMirrorWidget
          value={code()}
          language="javascript"
          theme="light"
          height="300px"
          onChange={setCode}
        />
      </div>

      <div
        style={{
          background: '#f8f9fa',
          padding: '1rem',
          'border-radius': '8px',
          border: '1px solid #e9ecef',
        }}
      >
        <h4
          style={{
            margin: '0 0 0.5rem 0',
            color: '#333',
          }}
        >
          Current Code:
        </h4>
        <pre
          style={{
            margin: '0',
            'white-space': 'pre-wrap',
            'word-break': 'break-all',
            'font-size': '0.9rem',
            color: '#666',
          }}
        >
          {code()}
        </pre>
      </div>

      <div
        style={{
          'margin-top': '2rem',
          padding: '1rem',
          background: '#e7f3ff',
          'border-radius': '8px',
          border: '1px solid #b3d9ff',
        }}
      >
        <h4
          style={{
            margin: '0 0 0.5rem 0',
            color: '#0066cc',
          }}
        >
          Features Available:
        </h4>
        <ul
          style={{
            margin: '0',
            'padding-left': '1.5rem',
            color: '#0066cc',
          }}
        >
          <li>Syntax highlighting for JavaScript</li>
          <li>Autocompletion (try typing "con" and press Ctrl+Space)</li>
          <li>Search functionality (Ctrl+F)</li>
          <li>Line numbers and gutter</li>
          <li>Bracket matching</li>
          <li>Auto-indentation</li>
        </ul>
      </div>
    </div>
  );
};

export default SimpleCodeMirrorExample;
