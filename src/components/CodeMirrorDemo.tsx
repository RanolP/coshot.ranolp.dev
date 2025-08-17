import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import CodeMirrorWidget from './CodeMirrorWidget';

const CodeMirrorDemo: Component = () => {
  const [activeTab, setActiveTab] = createSignal('javascript');
  const [theme, setTheme] = createSignal<'light' | 'dark'>('dark');
  const [codeValue, setCodeValue] = createSignal('');

  const sampleCode = {
    javascript: `// JavaScript Example
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate first 10 Fibonacci numbers
const fibNumbers = [];
for (let i = 0; i < 10; i++) {
  fibNumbers.push(fibonacci(i));
}

console.log('Fibonacci sequence:', fibNumbers);

// ES6+ features
const arrowFunction = (x, y) => x + y;
const templateLiteral = \`Sum: \${arrowFunction(5, 3)}\`;
const destructuring = { a: 1, b: 2, ...{ c: 3 } };`,

    jsx: `// React JSX Example
import React, { useState, useEffect } from 'react';

const Counter = ({ initialValue = 0 }) => {
  const [count, setCount] = useState(initialValue);
  
  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);

  return (
    <div className="counter">
      <h2>Counter: {count}</h2>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
};

export default Counter;`,

    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeMirror Demo</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>Welcome to CodeMirror</h1>
        <nav>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#about">About</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <section id="hero">
            <h2>Powerful Code Editor</h2>
            <p>Experience the next generation of code editing with syntax highlighting, autocompletion, and more.</p>
            <button class="cta-button">Get Started</button>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2024 CodeMirror Demo</p>
    </footer>
</body>
</html>`,

    css: `/* CSS Example */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #17a2b8;
  --light-color: #f8f9fa;
  --dark-color: #343a40;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: var(--dark-color);
  background-color: var(--light-color);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header {
  background: linear-gradient(135deg, var(--primary-color), var(--info-color));
  color: white;
  padding: 2rem 0;
  text-align: center;
}

.nav {
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 1rem 0;
}

.nav ul {
  list-style: none;
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.nav a {
  text-decoration: none;
  color: var(--dark-color);
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav a:hover {
  color: var(--primary-color);
}

.button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.button-primary {
  background-color: var(--primary-color);
  color: white;
}

.button-primary:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
}`,
  };

  const handleCodeChange = (value: string) => {
    setCodeValue(value);
  };

  const handleLanguageChange = (language: string) => {
    setActiveTab(language);
    setCodeValue(sampleCode[language as keyof typeof sampleCode] || '');
  };

  const toggleTheme = () => {
    setTheme(theme() === 'dark' ? 'light' : 'dark');
  };

  return (
    <div
      class="codemirror-demo"
      style={{
        padding: '2rem',
        background: theme() === 'dark' ? '#1a1a1a' : '#f8f9fa',
        'min-height': '100vh',
        color: theme() === 'dark' ? '#fff' : '#000',
      }}
    >
      <div
        class="demo-header"
        style={{
          'text-align': 'center',
          'margin-bottom': '2rem',
        }}
      >
        <h1
          style={{
            'font-size': '2.5rem',
            'font-weight': 'bold',
            'margin-bottom': '1rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'background-clip': 'text',
            color: 'transparent',
          }}
        >
          CodeMirror Widget Demo
        </h1>
        <p
          style={{
            'font-size': '1.1rem',
            color: theme() === 'dark' ? '#ccc' : '#666',
            'margin-bottom': '2rem',
          }}
        >
          Experience a powerful code editor with syntax highlighting,
          autocompletion, and more
        </p>

        <div
          class="demo-controls"
          style={{
            display: 'flex',
            gap: '1rem',
            'justify-content': 'center',
            'flex-wrap': 'wrap',
            'margin-bottom': '2rem',
          }}
        >
          <button
            onClick={toggleTheme}
            style={{
              padding: '0.75rem 1.5rem',
              background: theme() === 'dark' ? '#404040' : '#e9ecef',
              border: 'none',
              'border-radius': '8px',
              color: theme() === 'dark' ? '#fff' : '#000',
              cursor: 'pointer',
              'font-weight': '500',
              transition: 'all 0.3s ease',
            }}
          >
            {theme() === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </div>

      <div
        class="language-tabs"
        style={{
          display: 'flex',
          gap: '0.5rem',
          'margin-bottom': '1rem',
          'flex-wrap': 'wrap',
          'justify-content': 'center',
        }}
      >
        {Object.keys(sampleCode).map((language) => (
          <button
            onClick={() => handleLanguageChange(language)}
            style={{
              padding: '0.75rem 1.5rem',
              background:
                activeTab() === language
                  ? theme() === 'dark'
                    ? '#667eea'
                    : '#007bff'
                  : theme() === 'dark'
                  ? '#404040'
                  : '#e9ecef',
              border: 'none',
              'border-radius': '8px',
              color:
                activeTab() === language
                  ? '#fff'
                  : theme() === 'dark'
                  ? '#fff'
                  : '#000',
              cursor: 'pointer',
              'font-weight': '500',
              transition: 'all 0.3s ease',
              'text-transform': 'uppercase',
            }}
          >
            {language}
          </button>
        ))}
      </div>

      <div
        class="editor-container"
        style={{
          'max-width': '1200px',
          margin: '0 auto',
          background: theme() === 'dark' ? '#2d2d2d' : '#fff',
          'border-radius': '12px',
          overflow: 'hidden',
          'box-shadow': '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <CodeMirrorWidget
          value={sampleCode[activeTab() as keyof typeof sampleCode] || ''}
          language={activeTab() as any}
          theme={theme()}
          height="500px"
          onChange={handleCodeChange}
          className="demo-editor"
        />
      </div>

      <div
        class="demo-features"
        style={{
          'margin-top': '3rem',
          'text-align': 'center',
        }}
      >
        <h2
          style={{
            'font-size': '2rem',
            'margin-bottom': '2rem',
            color: theme() === 'dark' ? '#fff' : '#000',
          }}
        >
          Features
        </h2>

        <div
          class="features-grid"
          style={{
            display: 'grid',
            'grid-template-columns': 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            'max-width': '1000px',
            margin: '0 auto',
          }}
        >
          {[
            {
              icon: '🎨',
              title: 'Syntax Highlighting',
              description:
                'Beautiful syntax highlighting for multiple programming languages',
            },
            {
              icon: '⚡',
              title: 'Autocompletion',
              description:
                'Intelligent code completion with context-aware suggestions',
            },
            {
              icon: '🔍',
              title: 'Search & Replace',
              description:
                'Powerful search and replace functionality with regex support',
            },
            {
              icon: '🎯',
              title: 'Linting',
              description:
                'Real-time code linting with error and warning indicators',
            },
            {
              icon: '🌓',
              title: 'Theme Support',
              description: 'Light and dark themes with customizable styling',
            },
            {
              icon: '📱',
              title: 'Responsive',
              description: 'Fully responsive design that works on all devices',
            },
          ].map((feature) => (
            <div
              style={{
                background: theme() === 'dark' ? '#404040' : '#f8f9fa',
                padding: '2rem',
                'border-radius': '12px',
                'text-align': 'center',
                transition: 'transform 0.3s ease',
              }}
            >
              <div
                style={{
                  'font-size': '3rem',
                  'margin-bottom': '1rem',
                }}
              >
                {feature.icon}
              </div>
              <h3
                style={{
                  'font-size': '1.25rem',
                  'font-weight': '600',
                  'margin-bottom': '0.5rem',
                  color: theme() === 'dark' ? '#fff' : '#000',
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  color: theme() === 'dark' ? '#ccc' : '#666',
                  'line-height': '1.6',
                }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CodeMirrorDemo;
