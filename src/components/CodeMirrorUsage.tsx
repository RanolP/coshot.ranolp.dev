import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import CodeMirrorWidget from './CodeMirrorWidget';

const CodeMirrorUsage: Component = () => {
  const [jsCode, setJsCode] = createSignal(`// JavaScript Example
function greet(name) {
  return \`Hello, \${name}!\`;
}

const message = greet('World');
console.log(message);`);

  const [htmlCode, setHtmlCode] = createSignal(`<!DOCTYPE html>
<html>
<head>
  <title>Example</title>
</head>
<body>
  <h1>Hello World</h1>
  <p>This is a simple HTML example.</p>
</body>
</html>`);

  const [cssCode, setCssCode] = createSignal(`/* CSS Example */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #f0f0f0;
}

h1 {
  color: #333;
  text-align: center;
}

p {
  color: #666;
  line-height: 1.6;
}`);

  return (
    <div
      class="codemirror-usage"
      style={{
        padding: '2rem',
        background: '#f8f9fa',
        'min-height': '100vh',
      }}
    >
      <div
        class="usage-header"
        style={{
          'text-align': 'center',
          'margin-bottom': '3rem',
        }}
      >
        <h1
          style={{
            'font-size': '2.5rem',
            'font-weight': 'bold',
            'margin-bottom': '1rem',
            color: '#333',
          }}
        >
          CodeMirror Widget Usage Examples
        </h1>
        <p
          style={{
            'font-size': '1.1rem',
            color: '#666',
            'max-width': '600px',
            margin: '0 auto',
          }}
        >
          Learn how to integrate and customize the CodeMirror widget in your
          SolidJS applications
        </p>
      </div>

      <div
        class="examples-grid"
        style={{
          display: 'grid',
          'grid-template-columns': 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '2rem',
          'max-width': '1400px',
          margin: '0 auto',
        }}
      >
        {/* Basic JavaScript Editor */}
        <div
          class="example-card"
          style={{
            background: '#fff',
            'border-radius': '12px',
            padding: '1.5rem',
            'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h3
            style={{
              'font-size': '1.25rem',
              'font-weight': '600',
              'margin-bottom': '1rem',
              color: '#333',
            }}
          >
            Basic JavaScript Editor
          </h3>
          <p
            style={{
              color: '#666',
              'margin-bottom': '1rem',
              'font-size': '0.9rem',
            }}
          >
            Simple JavaScript editor with syntax highlighting and autocompletion
          </p>
          <CodeMirrorWidget
            value={jsCode()}
            language="javascript"
            theme="light"
            height="200px"
            onChange={setJsCode}
          />
        </div>

        {/* HTML Editor */}
        <div
          class="example-card"
          style={{
            background: '#fff',
            'border-radius': '12px',
            padding: '1.5rem',
            'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h3
            style={{
              'font-size': '1.25rem',
              'font-weight': '600',
              'margin-bottom': '1rem',
              color: '#333',
            }}
          >
            HTML Editor
          </h3>
          <p
            style={{
              color: '#666',
              'margin-bottom': '1rem',
              'font-size': '0.9rem',
            }}
          >
            HTML editor with proper syntax highlighting and tag completion
          </p>
          <CodeMirrorWidget
            value={htmlCode()}
            language="html"
            theme="light"
            height="200px"
            onChange={setHtmlCode}
          />
        </div>

        {/* CSS Editor */}
        <div
          class="example-card"
          style={{
            background: '#fff',
            'border-radius': '12px',
            padding: '1.5rem',
            'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h3
            style={{
              'font-size': '1.25rem',
              'font-weight': '600',
              'margin-bottom': '1rem',
              color: '#333',
            }}
          >
            CSS Editor
          </h3>
          <p
            style={{
              color: '#666',
              'margin-bottom': '1rem',
              'font-size': '0.9rem',
            }}
          >
            CSS editor with property and value autocompletion
          </p>
          <CodeMirrorWidget
            value={cssCode()}
            language="css"
            theme="light"
            height="200px"
            onChange={setCssCode}
          />
        </div>

        {/* Dark Theme Editor */}
        <div
          class="example-card"
          style={{
            background: '#2d2d2d',
            'border-radius': '12px',
            padding: '1.5rem',
            'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.3)',
          }}
        >
          <h3
            style={{
              'font-size': '1.25rem',
              'font-weight': '600',
              'margin-bottom': '1rem',
              color: '#fff',
            }}
          >
            Dark Theme Editor
          </h3>
          <p
            style={{
              color: '#ccc',
              'margin-bottom': '1rem',
              'font-size': '0.9rem',
            }}
          >
            Dark theme editor perfect for low-light environments
          </p>
          <CodeMirrorWidget
            value={`// Dark theme example
const darkMode = true;
const theme = darkMode ? 'dark' : 'light';

console.log('Current theme:', theme);`}
            language="javascript"
            theme="dark"
            height="200px"
          />
        </div>

        {/* Read-only Editor */}
        <div
          class="example-card"
          style={{
            background: '#fff',
            'border-radius': '12px',
            padding: '1.5rem',
            'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h3
            style={{
              'font-size': '1.25rem',
              'font-weight': '600',
              'margin-bottom': '1rem',
              color: '#333',
            }}
          >
            Read-only Editor
          </h3>
          <p
            style={{
              color: '#666',
              'margin-bottom': '1rem',
              'font-size': '0.9rem',
            }}
          >
            Read-only editor for displaying code without allowing edits
          </p>
          <CodeMirrorWidget
            value={`// This is read-only code
function example() {
  return "You cannot edit this";
}`}
            language="javascript"
            theme="light"
            height="200px"
            readOnly={true}
          />
        </div>

        {/* Custom Height Editor */}
        <div
          class="example-card"
          style={{
            background: '#fff',
            'border-radius': '12px',
            padding: '1.5rem',
            'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h3
            style={{
              'font-size': '1.25rem',
              'font-weight': '600',
              'margin-bottom': '1rem',
              color: '#333',
            }}
          >
            Custom Height Editor
          </h3>
          <p
            style={{
              color: '#666',
              'margin-bottom': '1rem',
              'font-size': '0.9rem',
            }}
          >
            Editor with custom height for different use cases
          </p>
          <CodeMirrorWidget
            value={`// Custom height example
const config = {
  height: '150px',
  theme: 'light',
  language: 'javascript'
};`}
            language="javascript"
            theme="light"
            height="150px"
          />
        </div>
      </div>

      <div
        class="usage-documentation"
        style={{
          'margin-top': '4rem',
          background: '#fff',
          'border-radius': '12px',
          padding: '2rem',
          'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.1)',
          'max-width': '1000px',
          'margin-left': 'auto',
          'margin-right': 'auto',
        }}
      >
        <h2
          style={{
            'font-size': '2rem',
            'font-weight': 'bold',
            'margin-bottom': '1.5rem',
            color: '#333',
          }}
        >
          Usage Documentation
        </h2>

        <div
          class="props-table"
          style={{
            'margin-bottom': '2rem',
          }}
        >
          <h3
            style={{
              'font-size': '1.5rem',
              'font-weight': '600',
              'margin-bottom': '1rem',
              color: '#333',
            }}
          >
            Props
          </h3>
          <div
            style={{
              'overflow-x': 'auto',
            }}
          >
            <table
              style={{
                width: '100%',
                'border-collapse': 'collapse',
                'font-size': '0.9rem',
              }}
            >
              <thead>
                <tr
                  style={{
                    background: '#f8f9fa',
                    'border-bottom': '2px solid #dee2e6',
                  }}
                >
                  <th
                    style={{
                      padding: '0.75rem',
                      'text-align': 'left',
                      'font-weight': '600',
                    }}
                  >
                    Prop
                  </th>
                  <th
                    style={{
                      padding: '0.75rem',
                      'text-align': 'left',
                      'font-weight': '600',
                    }}
                  >
                    Type
                  </th>
                  <th
                    style={{
                      padding: '0.75rem',
                      'text-align': 'left',
                      'font-weight': '600',
                    }}
                  >
                    Default
                  </th>
                  <th
                    style={{
                      padding: '0.75rem',
                      'text-align': 'left',
                      'font-weight': '600',
                    }}
                  >
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    prop: 'value',
                    type: 'string',
                    default: '""',
                    description: 'Initial code content',
                  },
                  {
                    prop: 'language',
                    type: '"javascript" | "html" | "css" | "jsx" | "tsx"',
                    default: 'javascript',
                    description: 'Programming language for syntax highlighting',
                  },
                  {
                    prop: 'theme',
                    type: '"light" | "dark"',
                    default: 'light',
                    description: 'Editor theme',
                  },
                  {
                    prop: 'height',
                    type: 'string',
                    default: '300px',
                    description: 'Editor height',
                  },
                  {
                    prop: 'onChange',
                    type: '(value: string) => void',
                    default: 'undefined',
                    description: 'Callback when code changes',
                  },
                  {
                    prop: 'readOnly',
                    type: 'boolean',
                    default: 'false',
                    description: 'Make editor read-only',
                  },
                  {
                    prop: 'placeholder',
                    type: 'string',
                    default: '""',
                    description: 'Placeholder text when empty',
                  },
                  {
                    prop: 'className',
                    type: 'string',
                    default: '""',
                    description: 'Additional CSS classes',
                  },
                ].map((row) => (
                  <tr
                    style={{
                      'border-bottom': '1px solid #dee2e6',
                    }}
                  >
                    <td
                      style={{
                        padding: '0.75rem',
                        'font-family': 'monospace',
                        'font-weight': '500',
                        color: '#007bff',
                      }}
                    >
                      {row.prop}
                    </td>
                    <td
                      style={{
                        padding: '0.75rem',
                        'font-family': 'monospace',
                        color: '#6c757d',
                      }}
                    >
                      {row.type}
                    </td>
                    <td
                      style={{
                        padding: '0.75rem',
                        'font-family': 'monospace',
                        color: '#6c757d',
                      }}
                    >
                      {row.default}
                    </td>
                    <td
                      style={{
                        padding: '0.75rem',
                        color: '#333',
                      }}
                    >
                      {row.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div class="code-example">
          <h3
            style={{
              'font-size': '1.5rem',
              'font-weight': '600',
              'margin-bottom': '1rem',
              color: '#333',
            }}
          >
            Basic Usage
          </h3>
          <CodeMirrorWidget
            value={`import { Component } from 'solid-js';
import CodeMirrorWidget from './components/CodeMirrorWidget';

const MyComponent: Component = () => {
  const [code, setCode] = createSignal('');

  return (
    <CodeMirrorWidget
      value={code()}
      language="javascript"
      theme="dark"
      height="400px"
      onChange={setCode}
    />
  );
};`}
            language="javascript"
            theme="light"
            height="200px"
            readOnly={true}
          />
        </div>
      </div>
    </div>
  );
};

export default CodeMirrorUsage;
