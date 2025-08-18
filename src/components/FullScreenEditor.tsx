import type { Component } from 'solid-js';
import { createSignal, createEffect, onMount, onCleanup } from 'solid-js';
import type { BundledTheme } from 'shiki';
import ShikiCodeMirrorWidget from './codemirror/ShikiCodeMirrorWidget';
import { ShikiHighlighter } from './codemirror/ShikiHighlighter';
import { useTheme } from '../contexts/ThemeContext';

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

const FullScreenEditor: Component = () => {
  const { theme, setTheme, colors } = useTheme();
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

  const [language, setLanguage] = createSignal<string>('typescript');
  const [enableTwoslash, setEnableTwoslash] = createSignal(true);
  const [editorWidth, setEditorWidth] = createSignal<number | null>(null);
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
    let startWidth = editorWidth();
    
    // If width is null (auto mode), get the current actual width from the element
    if (startWidth === null && resizableRef) {
      startWidth = resizableRef.offsetWidth;
      // Set this as the initial fixed width
      setEditorWidth(startWidth);
    }

    const handleMouseMove = (e: MouseEvent) => {
      const currentWidth = startWidth || 900;
      if (direction === 'right') {
        setEditorWidth(Math.max(400, currentWidth + (e.clientX - startX) * 2));
      }
      if (direction === 'left') {
        setEditorWidth(Math.max(400, currentWidth - (e.clientX - startX) * 2));
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
    // Start with auto width (null)
    // Width will be set when user drags resize handles
  });

  return (
    <div 
      class="flex-1 flex flex-col overflow-hidden"
      style={{ 'background-color': colors()?.['editor.background'] || 'var(--theme-editor-background)' }}
    >
      <div 
        class="h-60px flex items-center gap-16px px-20px flex-shrink-0 z-100"
        style={{
          'background-color': colors()?.['activityBar.background'] || 'var(--theme-activityBar-background)',
          'border-bottom': `1px solid ${colors()?.['activityBar.border'] || 'var(--theme-activityBar-border)'}`
        }}
      >
        <label 
          class="flex items-center gap-8px text-14px cursor-pointer"
          style={{ color: colors()?.['activityBar.foreground'] || 'var(--theme-activityBar-foreground)' }}
        >
          <input
            type="checkbox"
            checked={enableTwoslash()}
            onChange={(e) => setEnableTwoslash(e.target.checked)}
            class="w-16px h-16px cursor-pointer"
          />
          TwoSlash
        </label>
        
        {editorWidth() !== null && (
          <button
            class="px-12px py-6px rounded-6px text-14px cursor-pointer transition-all"
            style={{
              'background-color': colors()?.['button.background'] || 'var(--theme-button-background)',
              border: `1px solid ${colors()?.['input.border'] || 'var(--theme-input-border)'}`,
              color: colors()?.['button.foreground'] || 'var(--theme-button-foreground)'
            }}
            onClick={() => setEditorWidth(null)}
            title="Reset to auto width"
          >
            Reset Width
          </button>
        )}
      </div>

      <div 
        class="flex-1 flex items-center justify-center overflow-hidden p-20px"
        style={{ 'background-color': colors()?.['editor.background'] || 'var(--theme-editor-background)' }}
      >
        <div 
          ref={resizableRef}
          class="relative rounded-12px shadow-[0_20px_60px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden"
          style={{
            'background-color': colors()?.['panel.background'] || 'var(--theme-panel-background)',
            border: `1px solid ${colors()?.['panel.border'] || 'var(--theme-panel-border)'}`,
            width: editorWidth() !== null ? `${editorWidth()}px` : 'fit-content',
            'max-width': editorWidth() === null ? '90vw' : undefined,
            'min-width': '400px',
            'max-height': '80vh',
            height: 'auto'
          }}
        >
          <div class="flex-1 overflow-hidden flex flex-col rounded-12px editor-container">
            <ShikiCodeMirrorWidget
              value={code()}
              language={language()}
              theme={theme()}
              onChange={setCode}
              onThemeChange={setTheme}
              onLanguageChange={setLanguage}
              enableTwoslash={enableTwoslash()}
              showThemeSelector={true}
              showLanguageSelector={true}
              lineWrapping={editorWidth() !== null}
            />
          </div>

          {/* Resize handles - always shown, dragging sets fixed width */}
          <div class="absolute top-10px bottom-10px right--4px w-8px cursor-ew-resize select-none z-10 hover:bg-[rgba(9,105,218,0.3)]" onMouseDown={(e) => handleMouseDown(e, 'right')} />
          <div class="absolute top-10px bottom-10px left--4px w-8px cursor-ew-resize select-none z-10 hover:bg-[rgba(9,105,218,0.3)]" onMouseDown={(e) => handleMouseDown(e, 'left')} />
        </div>
      </div>

      <div 
        class="h-32px flex items-center justify-between px-20px flex-shrink-0 text-12px z-100"
        style={{
          'background-color': colors()?.['statusBar.background'] || 'var(--theme-statusBar-background)',
          'border-top': `1px solid ${colors()?.['statusBar.border'] || 'var(--theme-statusBar-border)'}`,
          color: colors()?.['statusBar.foreground'] || 'var(--theme-statusBar-foreground)'
        }}
      >
        <div class="flex items-center gap-16px">
          <span class="flex items-center px-8px h-20px rounded-3px cursor-default">UTF-8</span>
          <span class="flex items-center px-8px h-20px rounded-3px cursor-default">LF</span>
          <span class="flex items-center px-8px h-20px rounded-3px cursor-default">{languageDisplayNames[language()] || language()}</span>
        </div>
        <div class="flex items-center gap-16px">
          <span class="flex items-center px-8px h-20px rounded-3px cursor-default">Ready</span>
        </div>
        <div class="flex items-center gap-16px">
          <span class="flex items-center px-8px h-20px rounded-3px cursor-default">Ln 1, Col 1</span>
          <span class="flex items-center px-8px h-20px rounded-3px cursor-default">
            {editorWidth() !== null ? `Width: ${editorWidth()}px` : 'Auto Width'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FullScreenEditor;