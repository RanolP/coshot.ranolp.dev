import type { Component } from 'solid-js';
import { Show } from 'solid-js';

interface FeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeaturesModal: Component<FeaturesModalProps> = (props) => {
  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      props.onClose();
    }
  };

  return (
    <Show when={props.isOpen}>
      <div class="modal-backdrop" onClick={handleBackdropClick}>
        <div class="modal-content">
          <div class="modal-header">
            <h2>Features & TwoSlash Tips</h2>
            <button class="close-button" onClick={props.onClose}>×</button>
          </div>
          <div class="modal-body">
            <div class="features-section">
              <h3>🚀 Features</h3>
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
            </div>
            
            <div class="twoslash-section">
              <h3>🔮 TwoSlash Tips</h3>
              <ul>
                <li><strong>Type queries:</strong> Add <code>//    ^?</code> under any variable to see its type</li>
                <li><strong>Hover tooltips:</strong> Hover over variables and functions to see type information</li>
                <li><strong>Error highlighting:</strong> Type errors are underlined with red squiggly lines</li>
                <li><strong>JSDoc support:</strong> Tooltips show detailed type information and JSDoc comments</li>
                <li><strong>Works with:</strong> TypeScript, JavaScript, TSX, and JSX files</li>
              </ul>
              
              <div class="example-code">
                <h4>Example:</h4>
                <pre><code>{`interface User {
  id: number;
  name: string;
}

const user: User = { id: 1, name: "Alice" };
const greeting = \`Hello, \${user.name}!\`;
//    ^?
// Shows: const greeting: string`}</code></pre>
              </div>
            </div>
            
            <div class="shortcuts-section">
              <h3>⌨️ Keyboard Shortcuts</h3>
              <ul>
                <li><kbd>Ctrl/Cmd + F</kbd> - Search in code</li>
                <li><kbd>Ctrl/Cmd + G</kbd> - Find next</li>
                <li><kbd>Ctrl/Cmd + Shift + G</kbd> - Find previous</li>
                <li><kbd>Tab</kbd> - Indent / Accept autocomplete</li>
                <li><kbd>Ctrl/Cmd + Space</kbd> - Trigger autocomplete</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default FeaturesModal;