import { createSignal, Show, type Component, onMount, createEffect, For } from 'solid-js';
import html2canvas from 'html2canvas';
import { useTheme } from '../contexts/ThemeContext';
import { ShikiHighlighter } from './codemirror/ShikiHighlighter';
import type { BundledLanguage, BundledTheme } from 'shiki';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  language: string;
  theme: BundledTheme;
  enableTwoslash: boolean;
  editorWidth: number | null;
}

interface TwoslashTooltip {
  id: string;
  line: number;
  character: number;
  text: string;
  html: string;
  type: 'hover' | 'query' | 'error';
  x: number;
  y: number;
}

const ShareModal: Component<ShareModalProps> = (props) => {
  const { colors } = useTheme();
  const [options, setOptions] = createSignal({
    scale: 2,
    backgroundColor: '',
    transparentBackground: false,
    padding: 32,
    showLineNumbers: true,
    format: 'png' as 'png' | 'jpeg',
    quality: 0.95,
  });
  const [isCapturing, setIsCapturing] = createSignal(false);
  const [previewHtml, setPreviewHtml] = createSignal('');
  const [tooltips, setTooltips] = createSignal<TwoslashTooltip[]>([]);
  const [draggedTooltip, setDraggedTooltip] = createSignal<string | null>(null);
  let previewRef: HTMLDivElement | undefined;
  let containerRef: HTMLDivElement | undefined;
  let highlighter: ShikiHighlighter | undefined;

  onMount(async () => {
    highlighter = new ShikiHighlighter({
      themes: ['github-light', 'github-dark', props.theme],
    });
    await highlighter.initialize();
  });

  createEffect(async () => {
    if (!props.isOpen || !highlighter) return;
    
    // Set default background color based on theme
    const themeColors = await highlighter.getThemeColors(props.theme);
    setOptions(prev => ({
      ...prev,
      backgroundColor: prev.backgroundColor || themeColors?.['editor.background'] || '#1e1e1e'
    }));

    // Generate preview HTML
    await generatePreview();
  });

  const generatePreview = async () => {
    if (!highlighter) return;

    try {
      await highlighter.loadLanguage(props.language);
      
      let html = '';
      const themeColors = await highlighter.getThemeColors(props.theme);
      const newTooltips: TwoslashTooltip[] = [];
      
      if (props.enableTwoslash && ['typescript', 'tsx', 'javascript', 'jsx'].includes(props.language)) {
        // Render with TwoSlash but keepNotations: false for screenshots
        const result = await highlighter.highlightWithTwoslash(
          props.code,
          props.language as BundledLanguage,
          props.theme,
          false // keepNotations: false for clean screenshots
        );
        
        // Build HTML with twoslash annotations
        html = '<div class="shiki-container" style="font-family: \'Cascadia Code\', \'JetBrains Mono\', monospace; font-size: 14px; line-height: 1.5; position: relative;">';
        
        result.lines.forEach((line, lineIndex) => {
          const lineNumber = lineIndex + 1;
          html += `<div class="line" data-line="${lineNumber}" style="display: flex; min-height: 21px;">`;
          
          if (options().showLineNumbers) {
            html += `<span class="line-number" style="user-select: none; width: 3em; text-align: right; padding-right: 1em; opacity: 0.5;">${lineNumber}</span>`;
          }
          
          html += '<span class="line-content" style="flex: 1; white-space: pre;">';
          
          // Just render the tokens normally
          html += highlighter.renderTokensToHtml(line.tokens);
          
          html += '</span></div>';
        });
        
        html += '</div>';
        
        // Process twoslash tooltips separately (after the main HTML is built)
        if (result.twoslashData && result.twoslashData.nodes) {
          for (const node of result.twoslashData.nodes) {
            if (node.type === 'query') {
              const tooltipId = `tooltip-${node.line}-${node.character}`;
              
              // Syntax highlight the tooltip text
              let tooltipHtml = '';
              if (node.text) {
                try {
                  // Try to highlight as TypeScript
                  const tooltipTokens = await highlighter.tokenize(
                    node.text,
                    'typescript' as BundledLanguage,
                    props.theme
                  );
                  tooltipHtml = tooltipTokens.map(line => 
                    highlighter.renderTokensToHtml(line.tokens)
                  ).join('<br>');
                } catch {
                  // Fallback to plain text
                  tooltipHtml = node.text.replace(/\n/g, '<br>');
                }
              }
              
              newTooltips.push({
                id: tooltipId,
                line: node.line,
                character: node.character,
                text: node.text || '',
                html: tooltipHtml,
                type: node.type as 'hover' | 'query',
                x: 100 + (node.character * 8), // Approximate positioning
                y: (node.line * 21) + 25  // Position below the line
              });
            }
          }
        }
      } else {
        // Regular Shiki highlighting
        const tokens = await highlighter.tokenize(
          props.code,
          props.language as BundledLanguage,
          props.theme
        );
        
        html = '<div class="shiki-container" style="font-family: \'Cascadia Code\', \'JetBrains Mono\', monospace; font-size: 14px; line-height: 1.5;">';
        
        tokens.forEach((line) => {
          html += '<div class="line" style="display: flex; min-height: 21px;">';
          
          if (options().showLineNumbers) {
            html += `<span class="line-number" style="user-select: none; width: 3em; text-align: right; padding-right: 1em; opacity: 0.5;">${line.line}</span>`;
          }
          
          html += '<span class="line-content" style="flex: 1; white-space: pre;">';
          html += highlighter.renderTokensToHtml(line.tokens);
          html += '</span></div>';
        });
        
        html += '</div>';
      }
      
      setPreviewHtml(html);
      setTooltips(newTooltips);
      
    } catch (error) {
      console.error('Failed to generate preview:', error);
    }
  };

  createEffect(() => {
    // Regenerate preview when options change
    if (props.isOpen && options().showLineNumbers !== undefined) {
      generatePreview();
    }
  });

  const handleTooltipDragStart = (e: MouseEvent, tooltipId: string) => {
    e.preventDefault();
    setDraggedTooltip(tooltipId);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const tooltip = tooltips().find(t => t.id === tooltipId);
    if (!tooltip) return;
    
    const originalX = tooltip.x;
    const originalY = tooltip.y;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      setTooltips(prev => prev.map(t => 
        t.id === tooltipId 
          ? { ...t, x: originalX + deltaX, y: originalY + deltaY }
          : t
      ));
    };
    
    const handleMouseUp = () => {
      setDraggedTooltip(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleCapture = async () => {
    if (!containerRef) return;
    
    setIsCapturing(true);
    
    try {
      const canvas = await html2canvas(containerRef, {
        scale: options().scale,
        backgroundColor: options().transparentBackground ? 'transparent' : options().backgroundColor,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      // Convert to blob and download
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `code-screenshot.${options().format}`;
            a.click();
            URL.revokeObjectURL(url);
          }
        },
        `image/${options().format}`,
        options().quality
      );
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!containerRef) return;
    
    setIsCapturing(true);
    
    try {
      const canvas = await html2canvas(containerRef, {
        scale: options().scale,
        backgroundColor: options().transparentBackground ? 'transparent' : options().backgroundColor,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      canvas.toBlob(async (blob) => {
        if (blob) {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
        }
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <Show when={props.isOpen}>
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4">
        <div 
          class="rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          style={{
            'background-color': colors()?.['dropdown.background'] || 'var(--theme-dropdown-background)',
            color: colors()?.['dropdown.foreground'] || 'var(--theme-dropdown-foreground)'
          }}
        >
          <div 
            class="flex items-center justify-between p-4 flex-shrink-0"
            style={{
              'border-bottom': `1px solid ${colors()?.['dropdown.border'] || 'var(--theme-dropdown-border)'}`
            }}
          >
            <h2 class="text-lg font-semibold">Share Options</h2>
            <button
              onClick={props.onClose}
              class="p-1 rounded-lg transition-colors"
              style={{
                'background-color': 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors()?.['list.hoverBackground'] || 'var(--theme-list-hoverBackground)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div class="i-lucide-x w-5 h-5" />
            </button>
          </div>

          <div class="flex flex-1 overflow-hidden">
            {/* Preview Section */}
            <div class="flex-1 p-4 overflow-auto flex items-center justify-center">
              <div 
                ref={containerRef}
                class="relative inline-block"
                style={{
                  padding: `${options().padding}px`,
                  'background-color': options().transparentBackground ? 'transparent' : options().backgroundColor,
                  'background-image': options().transparentBackground ? 
                    'repeating-conic-gradient(#80808010 0% 25%, transparent 0% 50%) 50% / 20px 20px' : 
                    'none'
                }}
              >
                <div 
                  ref={previewRef}
                  innerHTML={previewHtml()}
                  style={{
                    color: colors()?.['editor.foreground'] || 'var(--theme-editor-foreground)',
                    'background-color': options().transparentBackground ? 'transparent' : colors()?.['editor.background'] || 'var(--theme-editor-background)',
                    padding: '16px',
                    'border-radius': '8px',
                    position: 'relative',
                    width: props.editorWidth ? `${props.editorWidth}px` : 'fit-content',
                    'min-width': '400px',
                    'overflow-x': props.editorWidth ? 'auto' : 'visible'
                  }}
                />
                
                {/* Twoslash Tooltips */}
                <For each={tooltips()}>
                  {(tooltip) => (
                    <div
                      class="absolute z-50"
                      style={{
                        left: `${tooltip.x}px`,
                        top: `${tooltip.y}px`,
                        cursor: draggedTooltip() === tooltip.id ? 'grabbing' : 'grab'
                      }}
                      onMouseDown={(e) => handleTooltipDragStart(e, tooltip.id)}
                    >
                      <div 
                        class="px-3 py-2 rounded-md shadow-xl text-sm max-w-md"
                        style={{
                          'background-color': colors()?.['editorHoverWidget.background'] || colors()?.['dropdown.background'] || '#1e1e2e',
                          color: colors()?.['editorHoverWidget.foreground'] || colors()?.['dropdown.foreground'] || '#cdd6f4',
                          border: `1px solid ${colors()?.['editorHoverWidget.border'] || colors()?.['dropdown.border'] || '#313244'}`,
                          'box-shadow': '0 8px 32px rgba(0, 0, 0, 0.4)'
                        }}
                      >
                        <div 
                          style="margin: 0; font-family: 'Cascadia Code', 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.4; white-space: pre-wrap; word-break: break-word;"
                          innerHTML={tooltip.html}
                        />
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </div>

            {/* Options Section */}
            <div class="w-80 p-4 space-y-4 overflow-auto flex-shrink-0" style={{
              'border-left': `1px solid ${colors()?.['dropdown.border'] || 'var(--theme-dropdown-border)'}`
            }}>
              <div class="text-xs opacity-70 pb-2 border-b" style={{
                'border-color': colors()?.['dropdown.border'] || 'var(--theme-dropdown-border)'
              }}>
                Editor Width: {props.editorWidth ? `${props.editorWidth}px` : 'Auto'}
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-2">Scale</label>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="0.5"
                  value={options().scale}
                  onInput={(e) => setOptions({ ...options(), scale: parseFloat(e.currentTarget.value) })}
                  class="w-full"
                />
                <span 
                  class="text-sm"
                  style={{ color: colors()?.['descriptionForeground'] || 'var(--theme-descriptionForeground)' }}
                >{options().scale}x</span>
              </div>

              <div>
                <label class="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={options().transparentBackground}
                    onChange={(e) => setOptions({ ...options(), transparentBackground: e.currentTarget.checked })}
                  />
                  <span class="text-sm font-medium">Transparent Background</span>
                </label>
                <Show when={!options().transparentBackground}>
                  <input
                    type="color"
                    value={options().backgroundColor}
                    onInput={(e) => setOptions({ ...options(), backgroundColor: e.currentTarget.value })}
                    class="w-full h-10 rounded"
                    style={{
                      border: `1px solid ${colors()?.['input.border'] || 'var(--theme-input-border)'}`
                    }}
                  />
                </Show>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Padding (px)</label>
                <input
                  type="range"
                  min="0"
                  max="64"
                  step="8"
                  value={options().padding}
                  onInput={(e) => setOptions({ ...options(), padding: parseInt(e.currentTarget.value) })}
                  class="w-full"
                />
                <span 
                  class="text-sm"
                  style={{ color: colors()?.['descriptionForeground'] || 'var(--theme-descriptionForeground)' }}
                >{options().padding}px</span>
              </div>

              <div>
                <label class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options().showLineNumbers}
                    onChange={(e) => setOptions({ ...options(), showLineNumbers: e.currentTarget.checked })}
                  />
                  <span class="text-sm font-medium">Show Line Numbers</span>
                </label>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Format</label>
                <select
                  value={options().format}
                  onChange={(e) => setOptions({ ...options(), format: e.currentTarget.value as 'png' | 'jpeg' })}
                  class="w-full px-3 py-2 rounded-lg"
                  style={{
                    'background-color': colors()?.['input.background'] || 'var(--theme-input-background)',
                    border: `1px solid ${colors()?.['input.border'] || 'var(--theme-input-border)'}`,
                    color: colors()?.['input.foreground'] || 'var(--theme-input-foreground)'
                  }}
                >
                  <option value="png">PNG</option>
                  <option value="jpeg">JPEG</option>
                </select>
              </div>

              <Show when={options().format === 'jpeg'}>
                <div>
                  <label class="block text-sm font-medium mb-2">Quality</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={options().quality}
                    onInput={(e) => setOptions({ ...options(), quality: parseFloat(e.currentTarget.value) })}
                    class="w-full"
                  />
                  <span 
                    class="text-sm"
                    style={{ color: colors()?.['descriptionForeground'] || 'var(--theme-descriptionForeground)' }}
                  >{Math.round(options().quality * 100)}%</span>
                </div>
              </Show>

              <Show when={tooltips().length > 0}>
                <div class="text-xs opacity-70">
                  <div class="i-lucide-info w-3 h-3 inline-block mr-1" />
                  Drag tooltips to reposition them
                </div>
              </Show>

              <div class="flex gap-2 pt-4">
                <button
                  onClick={handleCapture}
                  disabled={isCapturing()}
                  class="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  style={{
                    'background-color': colors()?.['button.background'] || 'var(--theme-button-background)',
                    color: colors()?.['button.foreground'] || 'var(--theme-button-foreground)'
                  }}
                >
                  <div class="i-lucide-download w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={handleCopyToClipboard}
                  disabled={isCapturing()}
                  class="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  style={{
                    'background-color': colors()?.['button.secondaryBackground'] || colors()?.['button.background'] || 'var(--theme-button-background)',
                    color: colors()?.['button.secondaryForeground'] || colors()?.['button.foreground'] || 'var(--theme-button-foreground)'
                  }}
                >
                  <div class="i-lucide-copy w-4 h-4" />
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default ShareModal;