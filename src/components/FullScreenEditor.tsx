import type { Component } from 'solid-js';
import { createSignal, createEffect, onMount, onCleanup } from 'solid-js';
import type { BundledTheme } from 'shiki';
import ShikiCodeMirrorWidget from './codemirror/ShikiCodeMirrorWidget';
import { ShikiHighlighter } from './codemirror/ShikiHighlighter';
import SearchableThemeSelector from './SearchableThemeSelector';

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
  const [language, setLanguage] = createSignal<string>('typescript');
  const [enableTwoslash, setEnableTwoslash] = createSignal(true);
  const [editorWidth, setEditorWidth] = createSignal(900);
  const [editorHeight, setEditorHeight] = createSignal(600);
  const [isResizing, setIsResizing] = createSignal(false);

  let highlighterInstance: ShikiHighlighter | undefined;
  let resizableRef: HTMLDivElement | undefined;

  const initializeHighlighter = async () => {
    if (!highlighterInstance) {
      highlighterInstance = new ShikiHighlighter({
        themes: ['github-light', 'github-dark', theme()],
        // Languages will be loaded on demand
      });
      await highlighterInstance.initialize();
    }
  };

  createEffect(() => {
    initializeHighlighter();
  });

  const handleMouseDown = (e: MouseEvent, direction: string) => {
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = editorWidth();
    const startHeight = editorHeight();

    const handleMouseMove = (e: MouseEvent) => {
      if (direction.includes('right')) {
        setEditorWidth(Math.max(400, startWidth + (e.clientX - startX) * 2));
      }
      if (direction.includes('left')) {
        setEditorWidth(Math.max(400, startWidth - (e.clientX - startX) * 2));
      }
      if (direction.includes('bottom')) {
        setEditorHeight(Math.max(300, startHeight + (e.clientY - startY) * 2));
      }
      if (direction.includes('top')) {
        setEditorHeight(Math.max(300, startHeight - (e.clientY - startY) * 2));
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  onMount(() => {
    // Set initial size based on viewport
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setEditorWidth(Math.min(900, vw * 0.8));
    setEditorHeight(Math.min(600, vh * 0.7));
  });

  return (
    <div class="fullscreen-editor">
      <div class="editor-top-bar">
        <SearchableThemeSelector
          value={theme()}
          onChange={setTheme}
        />
        
        <select
          value={language()}
          onChange={(e) => setLanguage(e.target.value)}
          class="control-select"
        >
          <optgroup label="Web Languages">
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="scss">SCSS</option>
            <option value="sass">Sass</option>
            <option value="less">Less</option>
            <option value="stylus">Stylus</option>
          </optgroup>
          
          <optgroup label="JavaScript & TypeScript">
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="jsx">JSX</option>
            <option value="tsx">TSX</option>
            <option value="json">JSON</option>
            <option value="jsonc">JSON with Comments</option>
          </optgroup>
          
          <optgroup label="Web Frameworks">
            <option value="vue">Vue</option>
            <option value="svelte">Svelte</option>
            <option value="astro">Astro</option>
            <option value="angular-html">Angular HTML</option>
            <option value="angular-ts">Angular TypeScript</option>
          </optgroup>
          
          <optgroup label="Programming Languages">
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="csharp">C#</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="kotlin">Kotlin</option>
            <option value="swift">Swift</option>
            <option value="objective-c">Objective-C</option>
            <option value="scala">Scala</option>
            <option value="ruby">Ruby</option>
            <option value="php">PHP</option>
            <option value="perl">Perl</option>
            <option value="lua">Lua</option>
            <option value="dart">Dart</option>
            <option value="julia">Julia</option>
            <option value="r">R</option>
            <option value="matlab">MATLAB</option>
            <option value="fortran-free-form">Fortran</option>
            <option value="ada">Ada</option>
            <option value="pascal">Pascal</option>
            <option value="d">D</option>
            <option value="nim">Nim</option>
            <option value="crystal">Crystal</option>
            <option value="zig">Zig</option>
            <option value="v">V</option>
          </optgroup>
          
          <optgroup label="Functional Languages">
            <option value="haskell">Haskell</option>
            <option value="elm">Elm</option>
            <option value="fsharp">F#</option>
            <option value="ocaml">OCaml</option>
            <option value="scheme">Scheme</option>
            <option value="racket">Racket</option>
            <option value="clojure">Clojure</option>
            <option value="elixir">Elixir</option>
            <option value="erlang">Erlang</option>
            <option value="lisp">Lisp</option>
            <option value="purescript">PureScript</option>
            <option value="rescript">ReScript</option>
          </optgroup>
          
          <optgroup label="Shell & Scripts">
            <option value="bash">Bash</option>
            <option value="shell">Shell</option>
            <option value="powershell">PowerShell</option>
            <option value="fish">Fish</option>
            <option value="zsh">Zsh</option>
            <option value="bat">Batch</option>
            <option value="makefile">Makefile</option>
            <option value="cmake">CMake</option>
          </optgroup>
          
          <optgroup label="Data & Config">
            <option value="sql">SQL</option>
            <option value="graphql">GraphQL</option>
            <option value="prisma">Prisma</option>
            <option value="yaml">YAML</option>
            <option value="toml">TOML</option>
            <option value="xml">XML</option>
            <option value="csv">CSV</option>
            <option value="ini">INI</option>
            <option value="properties">Properties</option>
            <option value="dotenv">DotEnv</option>
          </optgroup>
          
          <optgroup label="Documentation">
            <option value="markdown">Markdown</option>
            <option value="mdx">MDX</option>
            <option value="latex">LaTeX</option>
            <option value="asciidoc">AsciiDoc</option>
            <option value="rst">reStructuredText</option>
          </optgroup>
          
          <optgroup label="DevOps & Cloud">
            <option value="dockerfile">Dockerfile</option>
            <option value="docker">Docker Compose</option>
            <option value="kubernetes">Kubernetes</option>
            <option value="terraform">Terraform</option>
            <option value="nginx">Nginx</option>
            <option value="apache">Apache</option>
          </optgroup>
          
          <optgroup label="Smart Contracts">
            <option value="solidity">Solidity</option>
            <option value="vyper">Vyper</option>
            <option value="move">Move</option>
            <option value="cairo">Cairo</option>
          </optgroup>
          
          <optgroup label="Low Level">
            <option value="asm">Assembly</option>
            <option value="wasm">WebAssembly</option>
            <option value="llvm">LLVM IR</option>
            <option value="cuda">CUDA</option>
            <option value="glsl">GLSL</option>
            <option value="hlsl">HLSL</option>
            <option value="wgsl">WGSL</option>
          </optgroup>
          
          <optgroup label="Other">
            <option value="vim">Vim Script</option>
            <option value="emacs-lisp">Emacs Lisp</option>
            <option value="regex">Regular Expression</option>
            <option value="diff">Diff</option>
            <option value="git-commit">Git Commit</option>
            <option value="git-rebase">Git Rebase</option>
            <option value="ssh-config">SSH Config</option>
            <option value="proto">Protocol Buffers</option>
          </optgroup>
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

      <div class="editor-wrapper">
        <div 
          ref={resizableRef}
          class="resizable-editor"
          style={{
            width: `${editorWidth()}px`,
            height: `${editorHeight()}px`,
          }}
        >
          <div class="editor-container">
            <ShikiCodeMirrorWidget
              value={code()}
              language={language()}
              theme={theme()}
              onChange={setCode}
              onThemeChange={setTheme}
              enableTwoslash={enableTwoslash()}
              showThemeSelector={false}
            />
          </div>

          {/* Resize handles */}
          <div class="resize-handle resize-handle-right" onMouseDown={(e) => handleMouseDown(e, 'right')} />
          <div class="resize-handle resize-handle-left" onMouseDown={(e) => handleMouseDown(e, 'left')} />
          <div class="resize-handle resize-handle-bottom" onMouseDown={(e) => handleMouseDown(e, 'bottom')} />
          <div class="resize-handle resize-handle-top" onMouseDown={(e) => handleMouseDown(e, 'top')} />
          <div class="resize-handle resize-handle-bottom-right" onMouseDown={(e) => handleMouseDown(e, 'bottom-right')} />
          <div class="resize-handle resize-handle-bottom-left" onMouseDown={(e) => handleMouseDown(e, 'bottom-left')} />
          <div class="resize-handle resize-handle-top-right" onMouseDown={(e) => handleMouseDown(e, 'top-right')} />
          <div class="resize-handle resize-handle-top-left" onMouseDown={(e) => handleMouseDown(e, 'top-left')} />
        </div>
      </div>

      <div class="editor-status-bar">
        <div class="status-left">
          <span class="status-item">UTF-8</span>
          <span class="status-item">LF</span>
          <span class="status-item">{language().toUpperCase()}</span>
        </div>
        <div class="status-center">
          <span class="status-item">Ready</span>
        </div>
        <div class="status-right">
          <span class="status-item">Ln 1, Col 1</span>
          <span class="status-item">{editorWidth()} × {editorHeight()}</span>
        </div>
      </div>
    </div>
  );
};

export default FullScreenEditor;