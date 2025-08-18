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
      <div class="fixed top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.7)] flex items-center justify-center z-1000 p-20px" onClick={handleBackdropClick}>
        <div class="bg-[#1a1a1a] rounded-12px border-1 border-[#333] max-w-800px w-full max-h-[90vh] overflow-y-auto text-white">
          <div class="flex justify-between items-center px-24px py-20px border-b-1 border-[#333]">
            <h2 class="m-0 text-24px font-600">Features & TwoSlash Tips</h2>
            <button class="bg-none border-none text-[#888] cursor-pointer p-0 w-32px h-32px flex items-center justify-center rounded-4px hover:bg-[#333] hover:text-white" onClick={props.onClose}>
              <div class="i-lucide:x w-20px h-20px" />
            </button>
          </div>
          <div class="p-24px">
            <div class="mb-32px">
              <h3 class="m-0 mb-16px text-20px font-600">🚀 Features</h3>
              <ul class="m-0 pl-20px">
                <li class="mb-8px leading-1.5">✨ Syntax highlighting powered by Shiki</li>
                <li class="mb-8px leading-1.5">🎨 Multiple theme support (60+ themes including GitHub, Dracula, Monokai, etc.)</li>
                <li class="mb-8px leading-1.5">📝 Support for TypeScript, JavaScript, TSX, JSX, CSS, and HTML</li>
                <li class="mb-8px leading-1.5">🔍 TwoSlash integration for TypeScript/JavaScript (hover for type info)</li>
                <li class="mb-8px leading-1.5">🚨 Error highlighting with TwoSlash</li>
                <li class="mb-8px leading-1.5">🔎 Search functionality (Ctrl/Cmd + F)</li>
                <li class="mb-8px leading-1.5">✅ Autocomplete support</li>
                <li class="mb-8px leading-1.5">📏 Line numbers and gutter</li>
              </ul>
            </div>
            
            <div class="mb-32px">
              <h3 class="m-0 mb-16px text-20px font-600">🔮 TwoSlash Tips</h3>
              <ul class="m-0 pl-20px">
                <li class="mb-8px leading-1.5"><strong>Type queries:</strong> Add <code class="bg-[#2a2a2a] px-6px py-2px rounded-4px font-mono text-14px">//    ^?</code> under any variable to see its type</li>
                <li class="mb-8px leading-1.5"><strong>Hover tooltips:</strong> Hover over variables and functions to see type information</li>
                <li class="mb-8px leading-1.5"><strong>Error highlighting:</strong> Type errors are underlined with red squiggly lines</li>
                <li class="mb-8px leading-1.5"><strong>JSDoc support:</strong> Tooltips show detailed type information and JSDoc comments</li>
                <li class="mb-8px leading-1.5"><strong>Works with:</strong> TypeScript, JavaScript, TSX, and JSX files</li>
              </ul>
              
              <div class="mt-16px">
                <h4 class="my-16px mx-0 text-16px font-600">Example:</h4>
                <pre class="bg-[#0d1117] border-1 border-[#333] rounded-8px p-16px mt-8px mb-0 overflow-x-auto"><code class="bg-none p-0 text-[#e6edf3] text-14px leading-1.4">{`interface User {
  id: number;
  name: string;
}

const user: User = { id: 1, name: "Alice" };
const greeting = \`Hello, \${user.name}!\`;
//    ^?
// Shows: const greeting: string`}</code></pre>
              </div>
            </div>
            
            <div class="mb-0">
              <h3 class="m-0 mb-16px text-20px font-600">⌨️ Keyboard Shortcuts</h3>
              <ul class="m-0 pl-20px">
                <li class="mb-8px leading-1.5"><kbd class="bg-[#333] border-1 border-[#555] rounded-4px px-6px py-2px font-inherit text-12px font-600 shadow-[0_1px_2px_rgba(0,0,0,0.3)]">Ctrl/Cmd + F</kbd> - Search in code</li>
                <li class="mb-8px leading-1.5"><kbd class="bg-[#333] border-1 border-[#555] rounded-4px px-6px py-2px font-inherit text-12px font-600 shadow-[0_1px_2px_rgba(0,0,0,0.3)]">Ctrl/Cmd + G</kbd> - Find next</li>
                <li class="mb-8px leading-1.5"><kbd class="bg-[#333] border-1 border-[#555] rounded-4px px-6px py-2px font-inherit text-12px font-600 shadow-[0_1px_2px_rgba(0,0,0,0.3)]">Ctrl/Cmd + Shift + G</kbd> - Find previous</li>
                <li class="mb-8px leading-1.5"><kbd class="bg-[#333] border-1 border-[#555] rounded-4px px-6px py-2px font-inherit text-12px font-600 shadow-[0_1px_2px_rgba(0,0,0,0.3)]">Tab</kbd> - Indent / Accept autocomplete</li>
                <li class="mb-8px leading-1.5"><kbd class="bg-[#333] border-1 border-[#555] rounded-4px px-6px py-2px font-inherit text-12px font-600 shadow-[0_1px_2px_rgba(0,0,0,0.3)]">Ctrl/Cmd + Space</kbd> - Trigger autocomplete</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default FeaturesModal;