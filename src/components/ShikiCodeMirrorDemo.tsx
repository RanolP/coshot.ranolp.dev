import type { Component } from 'solid-js';
import { createSignal, createEffect } from 'solid-js';
import type { BundledTheme } from 'shiki';
import ShikiCodeMirrorWidget from './codemirror/ShikiCodeMirrorWidget';
import { ShikiHighlighter } from './codemirror/ShikiHighlighter';

const ShikiCodeMirrorDemo: Component = () => {
  const [code, setCode] = createSignal(`// TypeScript example with TwoSlash support
interface User {
  id: number;
  name: string;
  email: string;
}

function greetUser(user: User): string {
  return \`Hello, \${user.name}!\`;
}

const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com"
};

// Multiple query tooltips demo
const greeting = greetUser(user);
//    ^?

const userId = user.id;
//    ^?

const userName = user.name;
//    ^?

const userEmail = user.email;
//    ^?

// You can see type errors by uncommenting this:
// @ts-expect-error: Intentional error for demo
// greetUser({ id: "not-a-number", name: "Bob" });
`);

  const [theme, setTheme] = createSignal<BundledTheme>('github-light');
  const [language, setLanguage] = createSignal<'typescript' | 'javascript' | 'tsx' | 'jsx' | 'css' | 'html'>('typescript');
  const [enableTwoslash, setEnableTwoslash] = createSignal(true);
  const [themeColors, setThemeColors] = createSignal<{bg: string; fg: string; border: string}>({
    bg: '#ffffff',
    fg: '#000000', 
    border: '#e1e4e8'
  });

  let highlighterInstance: ShikiHighlighter | undefined;

  // Initialize highlighter and update theme colors
  const initializeHighlighter = async () => {
    if (!highlighterInstance) {
      highlighterInstance = new ShikiHighlighter({
        themes: ['github-light', 'github-dark', theme()],
        langs: ['javascript', 'typescript'],
      });
      await highlighterInstance.initialize();
    }
    
    if (highlighterInstance.isInitialized()) {
      const colors = highlighterInstance.getThemeColors(theme());
      setThemeColors(colors);
    }
  };

  // Update theme colors when theme changes
  createEffect(() => {
    const currentTheme = theme();
    if (highlighterInstance && highlighterInstance.isInitialized()) {
      const colors = highlighterInstance.getThemeColors(currentTheme);
      setThemeColors(colors);
    } else {
      initializeHighlighter();
    }
  });

  const exampleCode = {
    typescript: `// TypeScript example with TwoSlash support
interface User {
  id: number;
  name: string;
  email: string;
}

function greetUser(user: User): string {
  return \`Hello, \${user.name}!\`;
}

const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com"
};

// Multiple query tooltips demo
const greeting = greetUser(user);
//    ^?

const userId = user.id;
//    ^?

const userName = user.name;
//    ^?

const userEmail = user.email;
//    ^?`,
    javascript: `// JavaScript example
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate first 10 Fibonacci numbers
const fibNumbers = [];
for (let i = 0; i < 10; i++) {
  fibNumbers.push(fibonacci(i));
}

console.log(fibNumbers);`,
    tsx: `// React TSX example with TwoSlash
import React, { useState } from 'react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ onClick, children, variant = 'primary' }) => {
  return (
    <button
      onClick={onClick}
      className={\`btn btn-\${variant}\`}
    >
      {children}
    </button>
  );
};

export default Button;`,
    jsx: `// React JSX example
import React, { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="counter">
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(count - 1)}>
        Decrement
      </button>
    </div>
  );
};

export default Counter;`,
    css: `/* CSS example with modern features */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --border-radius: 8px;
}

.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  padding: 2rem;
}

.card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shiki CodeMirror Demo</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to Shiki CodeMirror</h1>
    <p>A powerful code editor with syntax highlighting.</p>
  </div>
</body>
</html>`,
  };

  return (
    <div style={{ padding: '20px', 'max-width': '1200px', margin: '0 auto' }}>
      <h1 style={{ 'margin-bottom': '20px' }}>Shiki CodeMirror Demo</h1>
      
      <div style={{ 'margin-bottom': '20px', display: 'flex', gap: '10px', 'flex-wrap': 'wrap' }}>
        <div>
          <label style={{ 'margin-right': '10px' }}>Theme:</label>
          <select
            value={theme()}
            onChange={(e) => setTheme(e.target.value as BundledTheme)}
            style={{
              padding: '4px 8px',
              'border-radius': '4px',
              border: '1px solid #ccc',
            }}
          >
            <option value="github-light">GitHub Light (Default)</option>
            <option value="github-dark">GitHub Dark</option>
            <option disabled>--- Dark Themes ---</option>
            <option value="andromeeda">Andromeeda</option>
            <option value="ayu-dark">Ayu Dark</option>
            <option value="catppuccin-frappe">Catppuccin Frappé</option>
            <option value="catppuccin-macchiato">Catppuccin Macchiato</option>
            <option value="catppuccin-mocha">Catppuccin Mocha</option>
            <option value="dark-plus">Dark Plus</option>
            <option value="dracula">Dracula</option>
            <option value="dracula-soft">Dracula Soft</option>
            <option value="everforest-dark">Everforest Dark</option>
            <option value="github-dark-default">GitHub Dark Default</option>
            <option value="github-dark-dimmed">GitHub Dark Dimmed</option>
            <option value="github-dark-high-contrast">GitHub Dark High Contrast</option>
            <option value="gruvbox-dark-hard">Gruvbox Dark Hard</option>
            <option value="gruvbox-dark-medium">Gruvbox Dark Medium</option>
            <option value="gruvbox-dark-soft">Gruvbox Dark Soft</option>
            <option value="houston">Houston</option>
            <option value="kanagawa-dragon">Kanagawa Dragon</option>
            <option value="kanagawa-wave">Kanagawa Wave</option>
            <option value="laserwave">Laserwave</option>
            <option value="material-theme">Material Theme</option>
            <option value="material-theme-darker">Material Theme Darker</option>
            <option value="material-theme-ocean">Material Theme Ocean</option>
            <option value="material-theme-palenight">Material Theme Palenight</option>
            <option value="min-dark">Min Dark</option>
            <option value="monokai">Monokai</option>
            <option value="night-owl">Night Owl</option>
            <option value="nord">Nord</option>
            <option value="one-dark-pro">One Dark Pro</option>
            <option value="plastic">Plastic</option>
            <option value="poimandres">Poimandres</option>
            <option value="red">Red</option>
            <option value="rose-pine">Rose Pine</option>
            <option value="rose-pine-moon">Rose Pine Moon</option>
            <option value="slack-dark">Slack Dark</option>
            <option value="slack-ochin">Slack Ochin</option>
            <option value="solarized-dark">Solarized Dark</option>
            <option value="synthwave-84">Synthwave '84</option>
            <option value="tokyo-night">Tokyo Night</option>
            <option value="vesper">Vesper</option>
            <option value="vitesse-black">Vitesse Black</option>
            <option value="vitesse-dark">Vitesse Dark</option>
            <option disabled>--- Light Themes ---</option>
            <option value="aurora-x">Aurora X</option>
            <option value="catppuccin-latte">Catppuccin Latte</option>
            <option value="everforest-light">Everforest Light</option>
            <option value="github-light-default">GitHub Light Default</option>
            <option value="github-light-high-contrast">GitHub Light High Contrast</option>
            <option value="gruvbox-light-hard">Gruvbox Light Hard</option>
            <option value="gruvbox-light-medium">Gruvbox Light Medium</option>
            <option value="gruvbox-light-soft">Gruvbox Light Soft</option>
            <option value="kanagawa-lotus">Kanagawa Lotus</option>
            <option value="light-plus">Light Plus</option>
            <option value="material-theme-lighter">Material Theme Lighter</option>
            <option value="min-light">Min Light</option>
            <option value="one-light">One Light</option>
            <option value="rose-pine-dawn">Rose Pine Dawn</option>
            <option value="snazzy-light">Snazzy Light</option>
            <option value="solarized-light">Solarized Light</option>
            <option value="vitesse-light">Vitesse Light</option>
          </select>
        </div>
        
        <div>
          <label style={{ 'margin-right': '10px' }}>Language:</label>
          <select
            value={language()}
            onChange={(e) => {
              const lang = e.target.value as keyof typeof exampleCode;
              setLanguage(lang);
              setCode(exampleCode[lang]);
            }}
            style={{
              padding: '4px 8px',
              'border-radius': '4px',
              border: '1px solid #ccc',
            }}
          >
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
            <option value="tsx">TSX</option>
            <option value="jsx">JSX</option>
            <option value="css">CSS</option>
            <option value="html">HTML</option>
          </select>
        </div>
        
        <div>
          <label style={{ 'margin-right': '10px' }}>
            <input
              type="checkbox"
              checked={enableTwoslash()}
              onChange={(e) => setEnableTwoslash(e.target.checked)}
              style={{ 'margin-right': '5px' }}
            />
            Enable TwoSlash (TypeScript/JavaScript only)
          </label>
        </div>
      </div>

      <div style={{ 'margin-bottom': '20px' }}>
        <ShikiCodeMirrorWidget
          value={code()}
          language={language()}
          theme={theme()}
          height="500px"
          onChange={setCode}
          onThemeChange={setTheme}
          enableTwoslash={enableTwoslash()}
          showThemeSelector={true}
        />
      </div>

      <div style={{ 
        padding: '15px',
        background: themeColors().bg,
        'border-radius': '8px',
        border: `1px solid ${themeColors().border}`,
        color: themeColors().fg,
      }}>
        <h3>Features:</h3>
        <ul>
          <li>✨ Syntax highlighting powered by Shiki</li>
          <li>🎨 Multiple theme support (60+ themes including GitHub, Dracula, Monokai, etc.)</li>
          <li>📝 Support for TypeScript, JavaScript, TSX, JSX, CSS, and HTML</li>
          <li>🔍 TwoSlash integration for TypeScript/JavaScript (hover for type info)</li>
          <li>🚨 Error highlighting with TwoSlash</li>
          <li>🔎 Search functionality (Ctrl/Cmd + F)</li>
          <li>✅ Autocomplete support</li>
          <li>📏 Line numbers and gutter</li>
        </ul>
        
        {enableTwoslash() && ['typescript', 'tsx', 'javascript', 'jsx'].includes(language()) && (
          <div style={{ 'margin-top': '15px' }}>
            <h4>TwoSlash Tips:</h4>
            <ul>
              <li>Hover over variables and functions to see type information</li>
              <li>Type errors are underlined with red squiggly lines</li>
              <li>The tooltip shows detailed type information and JSDoc comments</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShikiCodeMirrorDemo;