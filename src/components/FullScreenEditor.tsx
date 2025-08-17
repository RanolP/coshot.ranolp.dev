import type { Component } from 'solid-js';
import { createSignal, createEffect } from 'solid-js';
import type { BundledTheme } from 'shiki';
import ShikiCodeMirrorWidget from './codemirror/ShikiCodeMirrorWidget';
import { ShikiHighlighter } from './codemirror/ShikiHighlighter';

const FullScreenEditor: Component = () => {
  const [code, setCode] = createSignal(`// Welcome to Coshot - TypeScript playground with TwoSlash support
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

// Hover over variables to see their types, or use ^? for type queries
const greeting = greetUser(user);
//    ^?

const userId = user.id;
//    ^?

// Try uncommenting this to see error highlighting:
// greetUser({ id: "not-a-number", name: "Bob" });
`);

  const [theme, setTheme] = createSignal<BundledTheme>('github-dark');
  const [language, setLanguage] = createSignal<'typescript' | 'javascript' | 'tsx' | 'jsx' | 'css' | 'html'>('typescript');
  const [enableTwoslash, setEnableTwoslash] = createSignal(true);

  let highlighterInstance: ShikiHighlighter | undefined;

  const initializeHighlighter = async () => {
    if (!highlighterInstance) {
      highlighterInstance = new ShikiHighlighter({
        themes: ['github-light', 'github-dark', theme()],
        langs: ['javascript', 'typescript'],
      });
      await highlighterInstance.initialize();
    }
  };

  createEffect(() => {
    initializeHighlighter();
  });

  return (
    <div class="fullscreen-editor">
      <div class="editor-controls">
        <select
          value={theme()}
          onChange={(e) => setTheme(e.target.value as BundledTheme)}
          class="control-select"
        >
          <option value="github-dark">GitHub Dark</option>
          <option value="github-light">GitHub Light</option>
          <option value="dracula">Dracula</option>
          <option value="monokai">Monokai</option>
          <option value="one-dark-pro">One Dark Pro</option>
          <option value="nord">Nord</option>
          <option value="tokyo-night">Tokyo Night</option>
          <option value="catppuccin-mocha">Catppuccin Mocha</option>
          <option value="rose-pine">Rose Pine</option>
          <option value="gruvbox-dark-hard">Gruvbox Dark</option>
        </select>
        
        <select
          value={language()}
          onChange={(e) => setLanguage(e.target.value as any)}
          class="control-select"
        >
          <option value="typescript">TypeScript</option>
          <option value="javascript">JavaScript</option>
          <option value="tsx">TSX</option>
          <option value="jsx">JSX</option>
          <option value="css">CSS</option>
          <option value="html">HTML</option>
        </select>
        
        <label class="twoslash-toggle">
          <input
            type="checkbox"
            checked={enableTwoslash()}
            onChange={(e) => setEnableTwoslash(e.target.checked)}
          />
          TwoSlash
        </label>
      </div>

      <div class="editor-container">
        <ShikiCodeMirrorWidget
          value={code()}
          language={language()}
          theme={theme()}
          height="calc(100vh - 120px)"
          onChange={setCode}
          onThemeChange={setTheme}
          enableTwoslash={enableTwoslash()}
          showThemeSelector={false}
        />
      </div>
    </div>
  );
};

export default FullScreenEditor;