import type { Component } from 'solid-js';
import { For, createSignal, createEffect, onCleanup, onMount } from 'solid-js';
import { Combobox, useListCollection } from '@ark-ui/solid/combobox';
import { useFilter } from '@ark-ui/solid/locale';
import type { BundledLanguage } from 'shiki';
import { useTheme } from '../contexts/ThemeContext';

interface LanguageOption {
  value: BundledLanguage;
  label: string;
  category: string;
}

const languages: LanguageOption[] = [
  // Web Languages
  { value: 'html', label: 'HTML', category: 'Web Languages' },
  { value: 'css', label: 'CSS', category: 'Web Languages' },
  { value: 'scss', label: 'SCSS', category: 'Web Languages' },
  { value: 'sass', label: 'Sass', category: 'Web Languages' },
  { value: 'less', label: 'Less', category: 'Web Languages' },
  { value: 'stylus', label: 'Stylus', category: 'Web Languages' },
  
  // JavaScript & TypeScript
  { value: 'javascript', label: 'JavaScript', category: 'JS/TS' },
  { value: 'typescript', label: 'TypeScript', category: 'JS/TS' },
  { value: 'jsx', label: 'JSX', category: 'JS/TS' },
  { value: 'tsx', label: 'TSX', category: 'JS/TS' },
  { value: 'json', label: 'JSON', category: 'JS/TS' },
  { value: 'jsonc', label: 'JSON with Comments', category: 'JS/TS' },
  
  // Web Frameworks
  { value: 'vue', label: 'Vue', category: 'Frameworks' },
  { value: 'svelte', label: 'Svelte', category: 'Frameworks' },
  { value: 'astro', label: 'Astro', category: 'Frameworks' },
  { value: 'angular-html', label: 'Angular HTML', category: 'Frameworks' },
  { value: 'angular-ts', label: 'Angular TypeScript', category: 'Frameworks' },
  
  // Programming Languages
  { value: 'python', label: 'Python', category: 'Programming' },
  { value: 'java', label: 'Java', category: 'Programming' },
  { value: 'cpp', label: 'C++', category: 'Programming' },
  { value: 'c', label: 'C', category: 'Programming' },
  { value: 'csharp', label: 'C#', category: 'Programming' },
  { value: 'go', label: 'Go', category: 'Programming' },
  { value: 'rust', label: 'Rust', category: 'Programming' },
  { value: 'kotlin', label: 'Kotlin', category: 'Programming' },
  { value: 'swift', label: 'Swift', category: 'Programming' },
  { value: 'objective-c', label: 'Objective-C', category: 'Programming' },
  { value: 'scala', label: 'Scala', category: 'Programming' },
  { value: 'ruby', label: 'Ruby', category: 'Programming' },
  { value: 'php', label: 'PHP', category: 'Programming' },
  { value: 'perl', label: 'Perl', category: 'Programming' },
  { value: 'lua', label: 'Lua', category: 'Programming' },
  { value: 'dart', label: 'Dart', category: 'Programming' },
  { value: 'julia', label: 'Julia', category: 'Programming' },
  { value: 'r', label: 'R', category: 'Programming' },
  { value: 'matlab', label: 'MATLAB', category: 'Programming' },
  { value: 'fortran-free-form', label: 'Fortran', category: 'Programming' },
  { value: 'ada', label: 'Ada', category: 'Programming' },
  { value: 'pascal', label: 'Pascal', category: 'Programming' },
  { value: 'd', label: 'D', category: 'Programming' },
  { value: 'nim', label: 'Nim', category: 'Programming' },
  { value: 'crystal', label: 'Crystal', category: 'Programming' },
  { value: 'zig', label: 'Zig', category: 'Programming' },
  { value: 'v', label: 'V', category: 'Programming' },
  
  // Functional Languages
  { value: 'haskell', label: 'Haskell', category: 'Functional' },
  { value: 'elm', label: 'Elm', category: 'Functional' },
  { value: 'fsharp', label: 'F#', category: 'Functional' },
  { value: 'ocaml', label: 'OCaml', category: 'Functional' },
  { value: 'scheme', label: 'Scheme', category: 'Functional' },
  { value: 'racket', label: 'Racket', category: 'Functional' },
  { value: 'clojure', label: 'Clojure', category: 'Functional' },
  { value: 'elixir', label: 'Elixir', category: 'Functional' },
  { value: 'erlang', label: 'Erlang', category: 'Functional' },
  { value: 'lisp', label: 'Lisp', category: 'Functional' },
  { value: 'purescript', label: 'PureScript', category: 'Functional' },
  
  // Shell & Scripts
  { value: 'bash', label: 'Bash', category: 'Shell' },
  { value: 'shell', label: 'Shell', category: 'Shell' },
  { value: 'powershell', label: 'PowerShell', category: 'Shell' },
  { value: 'fish', label: 'Fish', category: 'Shell' },
  { value: 'zsh', label: 'Zsh', category: 'Shell' },
  { value: 'bat', label: 'Batch', category: 'Shell' },
  { value: 'makefile', label: 'Makefile', category: 'Shell' },
  { value: 'cmake', label: 'CMake', category: 'Shell' },
  
  // Data & Config
  { value: 'sql', label: 'SQL', category: 'Data' },
  { value: 'graphql', label: 'GraphQL', category: 'Data' },
  { value: 'prisma', label: 'Prisma', category: 'Data' },
  { value: 'yaml', label: 'YAML', category: 'Config' },
  { value: 'toml', label: 'TOML', category: 'Config' },
  { value: 'xml', label: 'XML', category: 'Data' },
  { value: 'csv', label: 'CSV', category: 'Data' },
  { value: 'ini', label: 'INI', category: 'Config' },
  { value: 'properties', label: 'Properties', category: 'Config' },
  { value: 'dotenv', label: 'DotEnv', category: 'Config' },
  
  // Documentation
  { value: 'markdown', label: 'Markdown', category: 'Docs' },
  { value: 'mdx', label: 'MDX', category: 'Docs' },
  { value: 'latex', label: 'LaTeX', category: 'Docs' },
  { value: 'asciidoc', label: 'AsciiDoc', category: 'Docs' },
  { value: 'rst', label: 'reStructuredText', category: 'Docs' },
  
  // DevOps & Cloud
  { value: 'dockerfile', label: 'Dockerfile', category: 'DevOps' },
  { value: 'docker', label: 'Docker Compose', category: 'DevOps' },
  { value: 'terraform', label: 'Terraform', category: 'DevOps' },
  { value: 'nginx', label: 'Nginx', category: 'DevOps' },
  { value: 'apache', label: 'Apache', category: 'DevOps' },
  
  // Smart Contracts
  { value: 'solidity', label: 'Solidity', category: 'Blockchain' },
  { value: 'vyper', label: 'Vyper', category: 'Blockchain' },
  { value: 'move', label: 'Move', category: 'Blockchain' },
  { value: 'cairo', label: 'Cairo', category: 'Blockchain' },
  
  // Low Level
  { value: 'asm', label: 'Assembly', category: 'Low Level' },
  { value: 'wasm', label: 'WebAssembly', category: 'Low Level' },
  { value: 'llvm', label: 'LLVM IR', category: 'Low Level' },
  { value: 'glsl', label: 'GLSL', category: 'Low Level' },
  { value: 'hlsl', label: 'HLSL', category: 'Low Level' },
  { value: 'wgsl', label: 'WGSL', category: 'Low Level' },
  
  // Other
  { value: 'vim', label: 'Vim Script', category: 'Other' },
  { value: 'emacs-lisp', label: 'Emacs Lisp', category: 'Other' },
  { value: 'regex', label: 'Regular Expression', category: 'Other' },
  { value: 'diff', label: 'Diff', category: 'Other' },
  { value: 'git-commit', label: 'Git Commit', category: 'Other' },
  { value: 'git-rebase', label: 'Git Rebase', category: 'Other' },
  { value: 'ssh-config', label: 'SSH Config', category: 'Other' },
  { value: 'proto', label: 'Protocol Buffers', category: 'Other' },
];

interface SearchableLanguageSelectorProps {
  value: BundledLanguage;
  onChange: (language: BundledLanguage) => void;
}

const SearchableLanguageSelector: Component<SearchableLanguageSelectorProps> = (
  props,
) => {
  const { colors } = useTheme();
  const filterFn = useFilter({ sensitivity: 'base' });
  const [triggerClicked, setTriggerClicked] = createSignal(false);
  const [inputValue, setInputValue] = createSignal('');
  const [isFocused, setIsFocused] = createSignal(false);
  
  // Get the label for the current language value
  const getCurrentLanguageLabel = () => {
    const currentLanguage = languages.find(l => l.value === props.value);
    return currentLanguage?.label || props.value;
  };
  
  // Initialize input value with current language label
  createEffect(() => {
    setInputValue(getCurrentLanguageLabel());
  });
  
  // Apply dynamic styles for hover and selected states
  createEffect(() => {
    const themeColors = colors();
    if (!themeColors) return;
    
    // Create or update style element for dynamic states
    let styleEl = document.getElementById('language-selector-dynamic-styles') as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'language-selector-dynamic-styles';
      document.head.appendChild(styleEl);
    }
    
    styleEl.textContent = `
      .language-selector-item[data-highlighted] {
        background-color: ${themeColors['list.hoverBackground']} !important;
      }
      .language-selector-item[data-selected] {
        background-color: ${themeColors['list.activeSelectionBackground']} !important;
        color: ${themeColors['list.activeSelectionForeground']} !important;
      }
    `;
  });
  
  onCleanup(() => {
    const styleEl = document.getElementById('language-selector-dynamic-styles');
    if (styleEl) {
      styleEl.remove();
    }
  });

  const { collection, filter } = useListCollection<LanguageOption>({
    initialItems: languages,
    filter: filterFn().contains,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  });

  const handleInputChange = (details: any) => {
    // Update the input value for auto-sizing
    setInputValue(details.inputValue);
    
    // Only filter if user is typing, not when trigger was clicked
    if (!triggerClicked()) {
      filter(details.inputValue);
    }
    setTriggerClicked(false);
  };

  const handleValueChange = (details: any) => {
    if (details.value[0]) {
      props.onChange(details.value[0] as BundledLanguage);
    }
  };

  const handleTriggerClick = () => {
    setTriggerClicked(true);
    // Clear filter to show all languages
    filter('');
  };


  return (
    <Combobox.Root
      collection={collection()}
      value={[props.value]}
      inputValue={getCurrentLanguageLabel()}
      onValueChange={handleValueChange}
      onInputValueChange={handleInputChange}
      multiple={false}
      class="inline-flex items-center gap-8px rounded-6px transition-background-color"
      style={{
        'background-color': isFocused() ? (colors()?.['input.background'] || 'var(--theme-input-background)') : 'transparent'
      }}
    >
      <div 
        class="i-lucide:globe w-16px h-16px flex-shrink-0 ml-8px"
        style={{ color: colors()?.['input.foreground'] || 'var(--theme-input-foreground)' }}
      />
      <Combobox.Control class="relative inline-flex items-center">
        <label 
          class="inline-grid items-center relative rounded-6px after:content-[attr(data-value)_'_'] after:invisible after:whitespace-pre-wrap after:pr-32px after:py-8px after:grid-area-[1/1] after:w-auto after:font-inherit after:text-13px after:pointer-events-none"
          data-value={inputValue()}
        >
          <Combobox.Input
            class="text-13px cursor-pointer focus:cursor-text grid-area-[1/1] w-auto pr-32px py-8px border-none outline-none focus:outline-none focus-visible:outline-none appearance-none font-inherit rounded-6px bg-transparent transition-background-color"
            size="1"
            style={{
              color: colors()?.['input.foreground'] || 'var(--theme-input-foreground)'
            }}
            onFocus={() => {
              setIsFocused(true);
            }}
            onBlur={() => {
              setIsFocused(false);
            }}
            placeholder=""
          />
        </label>
        <Combobox.Trigger
          class="absolute right-8px top-1/2 -translate-y-1/2 flex items-center cursor-pointer border-none z-10"
          style={{
            'background-color': 'transparent',
            color: colors()?.['input.foreground'] || 'var(--theme-input-foreground)'
          }}
          onClick={handleTriggerClick}
        >
          <div class="i-lucide:chevron-down w-16px h-16px transition-transform duration-200 data-[state=open]:rotate-180" />
        </Combobox.Trigger>
      </Combobox.Control>

      <Combobox.Positioner>
        <Combobox.Content class="rounded-6px max-h-300px overflow-y-auto z-1000 shadow-[0_4px_12px_rgba(0,0,0,0.3)] py-4px w-max outline-none focus:outline-none" style={{
          'background-color': colors()?.['dropdown.background'] || 'var(--theme-dropdown-background)',
          border: `1px solid ${colors()?.['dropdown.border'] || 'var(--theme-dropdown-border)'}`
        }}>
          <For each={collection().items}>
            {(language) => (
              <Combobox.Item
                item={language}
                class="language-selector-item px-12px py-8px cursor-pointer text-13px transition-colors duration-100"
                style={{
                  color: colors()?.['list.inactiveSelectionForeground'] || colors()?.['editor.foreground'] || 'var(--theme-editor-foreground)'
                }}
                data-selected={language.value === props.value ? '' : undefined}
              >
                <Combobox.ItemText>
                  {language.label}
                </Combobox.ItemText>
              </Combobox.Item>
            )}
          </For>
        </Combobox.Content>
      </Combobox.Positioner>
    </Combobox.Root>
  );
};

export default SearchableLanguageSelector;
