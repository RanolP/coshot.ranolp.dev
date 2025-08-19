import type { Component } from 'solid-js';
import { Show, createSignal, onMount } from 'solid-js';
import { useTheme } from '../contexts/theme-context';
import Tour from './tour';

interface FeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeaturesModal: Component<FeaturesModalProps> = (props) => {
  const { colors } = useTheme();
  const [showTour, setShowTour] = createSignal(false);

  // Initialize from localStorage with default false
  const getInitialMacState = () => {
    const stored = localStorage.getItem('coshot-is-mac');
    return stored === 'true';
  };

  const [isMac, setIsMac] = createSignal(getInitialMacState());

  // Save to localStorage when changed
  const handleMacToggle = (checked: boolean) => {
    setIsMac(checked);
    localStorage.setItem('coshot-is-mac', String(checked));
  };

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      props.onClose();
    }
  };

  const startTour = () => {
    props.onClose();
    setShowTour(true);
  };

  return (
    <>
      <Show when={props.isOpen}>
        <div
          class="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-10000 p-20px"
          style={{ 'background-color': 'rgba(0,0,0,0.7)' }}
          onClick={handleBackdropClick}
        >
          <div
            class="rounded-12px max-w-800px w-full max-h-[90vh] overflow-y-auto p-6"
            style={{
              'background-color': colors()?.['panel.background'] || 'var(--theme-panel-background)',
              border: `1px solid ${colors()?.['panel.border'] || 'var(--theme-panel-border)'}`,
              color: colors()?.['editor.foreground'] || 'var(--theme-editor-foreground)',
            }}
          >
            <div class="flex justify-between items-center mb-16px">
              <h2 class="m-0 text-24px font-600">Quick Reference</h2>
              <button
                class="bg-none border-none cursor-pointer p-0 w-32px h-32px flex items-center justify-center rounded-4px"
                style={{
                  color:
                    colors()?.['input.placeholderForeground'] ||
                    'var(--theme-input-placeholderForeground)',
                }}
                onClick={props.onClose}
              >
                <div class="i-lucide:x w-20px h-20px" />
              </button>
            </div>

            <div class="grid grid-cols-1 gap-16px">
              <div
                class="p-12px rounded-8px"
                style={{
                  'background-color':
                    colors()?.['editor.lineHighlightBackground'] ||
                    'var(--theme-editor-lineHighlightBackground)',
                  border: `1px solid ${colors()?.['panel.border'] || 'var(--theme-panel-border)'}`,
                }}
              >
                <h3 class="m-0 mb-8px text-14px font-600 opacity-90">✨ What is Coshot?</h3>
                <p class="m-0 mb-12px text-13px opacity-80">
                  Create beautiful, shareable code screenshots with a full-featured CodeMirror
                  editor. Features TypeScript type checking via TwoSlash, 60+ themes, and 200+
                  language support—perfect for sharing code snippets with visible type information
                  and error detection.
                </p>
                <div class="flex justify-end">
                  <button
                    class="px-16px py-8px rounded-6px border-none cursor-pointer font-500 text-14px flex items-center gap-6px transition-all"
                    style={{
                      'background-color':
                        colors()?.['button.background'] || 'var(--theme-button-background)',
                      color: colors()?.['button.foreground'] || 'var(--theme-button-foreground)',
                    }}
                    onClick={startTour}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        colors()?.['button.hoverBackground'] ||
                        'var(--theme-button-hoverBackground)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        colors()?.['button.background'] || 'var(--theme-button-background)';
                    }}
                  >
                    <div class="i-lucide:play-circle w-16px h-16px" />
                    Start Interactive Tour
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-16px mt-8px">
                <div
                  class="p-16px rounded-8px"
                  style={{
                    'background-color':
                      colors()?.['editor.lineHighlightBackground'] ||
                      'var(--theme-editor-lineHighlightBackground)',
                    border: `1px solid ${
                      colors()?.['panel.border'] || 'var(--theme-panel-border)'
                    }`,
                  }}
                >
                  <div class="flex items-center justify-between mb-12px">
                    <h3 class="m-0 text-16px font-600 opacity-80">⌨️ Keyboard Shortcuts</h3>
                    <label class="flex items-center gap-4px text-12px cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isMac()}
                        onChange={(e) => handleMacToggle(e.target.checked)}
                        class="w-14px h-14px cursor-pointer"
                      />
                      <span class="opacity-70">Mac</span>
                    </label>
                  </div>
                  <div class="space-y-2px">
                    <div class="grid grid-cols-[1fr_20px_1fr] items-center gap-8px p-6px rounded-6px transition-all hover:bg-black/3 dark:hover:bg-white/3">
                      <div class="flex items-center gap-2px justify-end">
                        <kbd
                          class="px-7px py-2px rounded-4px font-mono text-11px font-600"
                          style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            'backdrop-filter': 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            'box-shadow':
                              '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                            color:
                              colors()?.['editor.foreground'] || 'var(--theme-editor-foreground)',
                          }}
                        >
                          {isMac() ? '⌘' : 'Ctrl'}
                        </kbd>
                        <span class="text-10px opacity-40 mx-1px">+</span>
                        <kbd
                          class="px-7px py-2px rounded-4px font-mono text-11px font-600"
                          style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            'backdrop-filter': 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            'box-shadow':
                              '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                            color:
                              colors()?.['editor.foreground'] || 'var(--theme-editor-foreground)',
                          }}
                        >
                          F
                        </kbd>
                      </div>
                      <div class="flex justify-center">
                        <div class="i-lucide:arrow-right w-12px h-12px opacity-30" />
                      </div>
                      <span class="text-13px">Search in code</span>
                    </div>
                    <div class="grid grid-cols-[1fr_20px_1fr] items-center gap-8px p-6px rounded-6px transition-all hover:bg-black/3 dark:hover:bg-white/3">
                      <div class="flex items-center gap-2px justify-end">
                        <kbd
                          class="px-7px py-2px rounded-4px font-mono text-11px font-600"
                          style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            'backdrop-filter': 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            'box-shadow':
                              '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                            color:
                              colors()?.['editor.foreground'] || 'var(--theme-editor-foreground)',
                          }}
                        >
                          {isMac() ? '⌘' : 'Ctrl'}
                        </kbd>
                        <span class="text-10px opacity-40 mx-1px">+</span>
                        <kbd
                          class="px-7px py-2px rounded-4px font-mono text-11px font-600"
                          style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            'backdrop-filter': 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            'box-shadow':
                              '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                            color:
                              colors()?.['editor.foreground'] || 'var(--theme-editor-foreground)',
                          }}
                        >
                          G
                        </kbd>
                      </div>
                      <div class="flex justify-center">
                        <div class="i-lucide:arrow-right w-12px h-12px opacity-30" />
                      </div>
                      <span class="text-13px">Find next match</span>
                    </div>
                    <div class="grid grid-cols-[1fr_20px_1fr] items-center gap-8px p-6px rounded-6px transition-all hover:bg-black/3 dark:hover:bg-white/3">
                      <div class="flex items-center justify-end">
                        <kbd
                          class="px-10px py-2px rounded-4px font-mono text-11px font-600"
                          style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            'backdrop-filter': 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            'box-shadow':
                              '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                            color:
                              colors()?.['editor.foreground'] || 'var(--theme-editor-foreground)',
                          }}
                        >
                          Tab
                        </kbd>
                      </div>
                      <div class="flex justify-center">
                        <div class="i-lucide:arrow-right w-12px h-12px opacity-30" />
                      </div>
                      <span class="text-13px">Indent / Autocomplete</span>
                    </div>
                    <div class="grid grid-cols-[1fr_20px_1fr] items-center gap-8px p-6px rounded-6px transition-all hover:bg-black/3 dark:hover:bg-white/3">
                      <div class="flex items-center gap-2px justify-end">
                        <kbd
                          class="px-7px py-2px rounded-4px font-mono text-11px font-600"
                          style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            'backdrop-filter': 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            'box-shadow':
                              '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                            color:
                              colors()?.['editor.foreground'] || 'var(--theme-editor-foreground)',
                          }}
                        >
                          {isMac() ? '⌘' : 'Ctrl'}
                        </kbd>
                        <span class="text-10px opacity-40 mx-1px">+</span>
                        <kbd
                          class="px-7px py-2px rounded-4px font-mono text-11px font-600"
                          style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            'backdrop-filter': 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            'box-shadow':
                              '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                            color:
                              colors()?.['editor.foreground'] || 'var(--theme-editor-foreground)',
                          }}
                        >
                          Space
                        </kbd>
                      </div>
                      <div class="flex justify-center">
                        <div class="i-lucide:arrow-right w-12px h-12px opacity-30" />
                      </div>
                      <span class="text-13px">Trigger suggestions</span>
                    </div>
                  </div>
                </div>

                <div
                  class="p-16px rounded-8px"
                  style={{
                    'background-color':
                      colors()?.['editor.lineHighlightBackground'] ||
                      'var(--theme-editor-lineHighlightBackground)',
                    border: `1px solid ${
                      colors()?.['panel.border'] || 'var(--theme-panel-border)'
                    }`,
                  }}
                >
                  <h3 class="m-0 mb-12px text-16px font-600 opacity-80">
                    🔮 TwoSlash Notations{' '}
                    <span class="text-11px font-400 opacity-60">(TS/JS only)</span>
                  </h3>
                  <div class="space-y-6px">
                    <div class="flex items-center gap-8px">
                      <code
                        class="px-5px py-1px rounded-3px font-mono text-11px whitespace-nowrap"
                        style={{
                          'background-color':
                            colors()?.['panel.background'] || 'var(--theme-panel-background)',
                          border: `1px solid ${
                            colors()?.['panel.border'] || 'var(--theme-panel-border)'
                          }`,
                        }}
                      >
                        // ^?
                      </code>
                      <span class="text-12px opacity-90">Show type info</span>
                    </div>
                    <div class="flex items-center gap-8px">
                      <code
                        class="px-5px py-1px rounded-3px font-mono text-11px whitespace-nowrap"
                        style={{
                          'background-color':
                            colors()?.['panel.background'] || 'var(--theme-panel-background)',
                          border: `1px solid ${
                            colors()?.['panel.border'] || 'var(--theme-panel-border)'
                          }`,
                        }}
                      >
                        // ^|
                      </code>
                      <span class="text-12px opacity-90">Show completions</span>
                    </div>
                    <div class="flex items-center gap-8px">
                      <code
                        class="px-5px py-1px rounded-3px font-mono text-11px whitespace-nowrap"
                        style={{
                          'background-color':
                            colors()?.['panel.background'] || 'var(--theme-panel-background)',
                          border: `1px solid ${
                            colors()?.['panel.border'] || 'var(--theme-panel-border)'
                          }`,
                        }}
                      >
                        // ^^^
                      </code>
                      <span class="text-12px opacity-90">Highlight range</span>
                    </div>
                    <div class="flex items-center gap-8px">
                      <code
                        class="px-5px py-1px rounded-3px font-mono text-11px whitespace-nowrap"
                        style={{
                          'background-color':
                            colors()?.['panel.background'] || 'var(--theme-panel-background)',
                          border: `1px solid ${
                            colors()?.['panel.border'] || 'var(--theme-panel-border)'
                          }`,
                        }}
                      >
                        // @noErrors
                      </code>
                      <span class="text-12px opacity-90">Hide errors</span>
                    </div>
                    <div class="flex items-center gap-8px">
                      <code
                        class="px-5px py-1px rounded-3px font-mono text-11px whitespace-nowrap"
                        style={{
                          'background-color':
                            colors()?.['panel.background'] || 'var(--theme-panel-background)',
                          border: `1px solid ${
                            colors()?.['panel.border'] || 'var(--theme-panel-border)'
                          }`,
                        }}
                      >
                        // ---cut---
                      </code>
                      <span class="text-12px opacity-90">Hide code above</span>
                    </div>
                    <div class="flex items-center gap-8px">
                      <code
                        class="px-5px py-1px rounded-3px font-mono text-11px whitespace-nowrap"
                        style={{
                          'background-color':
                            colors()?.['panel.background'] || 'var(--theme-panel-background)',
                          border: `1px solid ${
                            colors()?.['panel.border'] || 'var(--theme-panel-border)'
                          }`,
                        }}
                      >
                        // @filename: x.ts
                      </code>
                      <span class="text-12px opacity-90">Set filename</span>
                    </div>
                    <div
                      class="mt-10px p-8px rounded-4px"
                      style={{
                        'background-color':
                          colors()?.['panel.background'] || 'var(--theme-panel-background)',
                        border: `1px solid ${
                          colors()?.['panel.border'] || 'var(--theme-panel-border)'
                        }`,
                      }}
                    >
                      <a
                        href="https://twoslash.netlify.app/refs/notations"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-11px no-underline flex items-center gap-4px justify-center hover:underline"
                        style={{
                          color: colors()?.['focusBorder'] || 'var(--theme-focusBorder)',
                        }}
                      >
                        <div class="i-lucide:external-link w-10px h-10px" />
                        Full TwoSlash Reference
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Show>
      <Tour isOpen={showTour()} onClose={() => setShowTour(false)} />
    </>
  );
};

export default FeaturesModal;
