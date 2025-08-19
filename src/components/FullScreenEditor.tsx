import type { Component } from 'solid-js';
import { createSignal, createEffect, onMount, onCleanup } from 'solid-js';
import type { BundledTheme } from 'shiki';
import ShikiCodeMirrorWidget from './codemirror/ShikiCodeMirrorWidget';
import { ShikiHighlighter } from './codemirror/ShikiHighlighter';
import { useTheme } from '../contexts/ThemeContext';
import TwoslashToggle from './TwoslashToggle';
import { languageDisplayNames } from '../utils/languageNames';
import ShareModal from './ShareModal';
import FeaturesModal from './FeaturesModal';

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
  const [showShareModal, setShowShareModal] = createSignal(false);
  const [showFeaturesModal, setShowFeaturesModal] = createSignal(false);

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
        setEditorWidth(Math.max(480, currentWidth + (e.clientX - startX) * 2));
      }
      if (direction === 'left') {
        setEditorWidth(Math.max(480, currentWidth - (e.clientX - startX) * 2));
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
      </div>

      <div 
        class="flex-1 flex flex-col items-center justify-center overflow-hidden p-20px"
        style={{ 'background-color': colors()?.['editor.background'] || 'var(--theme-editor-background)' }}
      >
        {/* Container for button and editor */}
        <div class="relative">
          {/* Reset Width Button - positioned above editor */}
          {editorWidth() !== null && (
            <button
              class="absolute px-10px py-4px rounded-6px text-12px cursor-pointer transition-all z-20"
              style={{
                'background-color': colors()?.['button.background'] || 'var(--theme-button-background)',
                border: `1px solid ${colors()?.['input.border'] || 'var(--theme-input-border)'}`,
                color: colors()?.['button.foreground'] || 'var(--theme-button-foreground)',
                top: '-30px',
                right: '0',
              }}
              onClick={() => setEditorWidth(null)}
              title="Reset to auto width"
            >
              <div class="i-lucide-maximize-2 w-12px h-12px inline-block mr-4px" />
              Auto Width
            </button>
          )}
          
          {/* Coshot Logo and Help button - positioned above editor */}
          <div 
            class="absolute z-30 flex items-center gap-12px"
            style={{ 
              top: '-32px',
              left: '0'
            }}
          >
            <h1 
              class="text-18px font-900 m-0 uppercase pointer-events-none" 
              style={{ 
                'letter-spacing': '0.15em',
                color: colors()?.['titleBar.activeForeground'] || 'var(--theme-titleBar-activeForeground)',
                opacity: '0.7'
              }}
            >
              COSHOT
            </h1>
            <button
              class="w-28px h-28px rounded-full border-2 cursor-pointer flex items-center justify-center transition-all duration-200"
              style={{
                'background-color': colors()?.['button.background'] || 'var(--theme-button-background)',
                'border-color': colors()?.['input.border'] || 'var(--theme-input-border)',
                color: colors()?.['button.foreground'] || 'var(--theme-button-foreground)'
              }}
              onClick={() => setShowFeaturesModal(true)}
              title="Features & TwoSlash Tips"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors()?.['button.hoverBackground'] || 'var(--theme-button-hoverBackground)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors()?.['button.background'] || 'var(--theme-button-background)';
              }}
            >
              <div class="i-lucide:help-circle w-16px h-16px" />
            </button>
          </div>
          
          <div 
            ref={resizableRef}
            class="relative rounded-12px shadow-[0_20px_60px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden"
            style={{
              'background-color': colors()?.['panel.background'] || 'var(--theme-panel-background)',
              border: `1px solid ${colors()?.['panel.border'] || 'var(--theme-panel-border)'}`,
              width: editorWidth() !== null ? `${editorWidth()}px` : 'fit-content',
              'max-width': editorWidth() === null ? '90vw' : undefined,
              'min-width': '480px',
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
              showTwoslashToggle={true}
              onTwoslashToggle={setEnableTwoslash}
              lineWrapping={editorWidth() !== null}
            />
          </div>

          {/* Resize handles - always shown, dragging sets fixed width */}
          <div class="absolute top-10px bottom-10px right--4px w-8px cursor-ew-resize select-none z-10 hover:bg-[rgba(9,105,218,0.3)]" onMouseDown={(e) => handleMouseDown(e, 'right')} />
          <div class="absolute top-10px bottom-10px left--4px w-8px cursor-ew-resize select-none z-10 hover:bg-[rgba(9,105,218,0.3)]" onMouseDown={(e) => handleMouseDown(e, 'left')} />
          
          {/* Share button - bottom right of editor */}
          <button
            onClick={() => setShowShareModal(true)}
            class="absolute bottom-10px right-10px flex items-center gap-6px px-10px py-6px rounded-6px cursor-pointer transition-all shadow-lg z-20"
            style={{
              'background-color': colors()?.['button.background'] || 'var(--theme-button-background)',
              color: colors()?.['button.foreground'] || 'var(--theme-button-foreground)',
              border: `1px solid ${colors()?.['input.border'] || 'var(--theme-input-border)'}`
            }}
            title="Share screenshot"
          >
            <div class="i-lucide-share-2 w-16px h-16px" />
            <span class="text-14px font-medium">Share</span>
          </button>
          </div>
        </div>
      </div>
      
      <ShareModal
        isOpen={showShareModal()}
        onClose={() => setShowShareModal(false)}
        code={code()}
        language={language()}
        theme={theme()}
        enableTwoslash={enableTwoslash()}
        editorWidth={editorWidth()}
      />
      
      <FeaturesModal 
        isOpen={showFeaturesModal()} 
        onClose={() => setShowFeaturesModal(false)} 
      />
    </div>
  );
};

export default FullScreenEditor;