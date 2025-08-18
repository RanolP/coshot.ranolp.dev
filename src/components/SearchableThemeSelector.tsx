import type { Component } from 'solid-js';
import { For, createSignal, createEffect, onCleanup } from 'solid-js';
import { Combobox, useListCollection } from '@ark-ui/solid/combobox';
import { useFilter } from '@ark-ui/solid/locale';
import type { BundledTheme } from 'shiki';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeOption {
  value: BundledTheme;
  label: string;
  category: 'dark' | 'light';
}

const themes: ThemeOption[] = [
  { value: 'github-dark', label: 'GitHub Dark', category: 'dark' },
  { value: 'github-light', label: 'GitHub Light', category: 'light' },
  { value: 'andromeeda', label: 'Andromeeda', category: 'dark' },
  { value: 'ayu-dark', label: 'Ayu Dark', category: 'dark' },
  { value: 'catppuccin-frappe', label: 'Catppuccin Frappé', category: 'dark' },
  {
    value: 'catppuccin-macchiato',
    label: 'Catppuccin Macchiato',
    category: 'dark',
  },
  { value: 'catppuccin-mocha', label: 'Catppuccin Mocha', category: 'dark' },
  { value: 'catppuccin-latte', label: 'Catppuccin Latte', category: 'light' },
  { value: 'dark-plus', label: 'Dark Plus', category: 'dark' },
  { value: 'dracula', label: 'Dracula', category: 'dark' },
  { value: 'dracula-soft', label: 'Dracula Soft', category: 'dark' },
  { value: 'everforest-dark', label: 'Everforest Dark', category: 'dark' },
  { value: 'everforest-light', label: 'Everforest Light', category: 'light' },
  {
    value: 'github-dark-default',
    label: 'GitHub Dark Default',
    category: 'dark',
  },
  {
    value: 'github-dark-dimmed',
    label: 'GitHub Dark Dimmed',
    category: 'dark',
  },
  {
    value: 'github-dark-high-contrast',
    label: 'GitHub Dark High Contrast',
    category: 'dark',
  },
  {
    value: 'github-light-default',
    label: 'GitHub Light Default',
    category: 'light',
  },
  {
    value: 'github-light-high-contrast',
    label: 'GitHub Light High Contrast',
    category: 'light',
  },
  { value: 'gruvbox-dark-hard', label: 'Gruvbox Dark Hard', category: 'dark' },
  {
    value: 'gruvbox-dark-medium',
    label: 'Gruvbox Dark Medium',
    category: 'dark',
  },
  { value: 'gruvbox-dark-soft', label: 'Gruvbox Dark Soft', category: 'dark' },
  {
    value: 'gruvbox-light-hard',
    label: 'Gruvbox Light Hard',
    category: 'light',
  },
  {
    value: 'gruvbox-light-medium',
    label: 'Gruvbox Light Medium',
    category: 'light',
  },
  {
    value: 'gruvbox-light-soft',
    label: 'Gruvbox Light Soft',
    category: 'light',
  },
  { value: 'houston', label: 'Houston', category: 'dark' },
  { value: 'kanagawa-dragon', label: 'Kanagawa Dragon', category: 'dark' },
  { value: 'kanagawa-wave', label: 'Kanagawa Wave', category: 'dark' },
  { value: 'kanagawa-lotus', label: 'Kanagawa Lotus', category: 'light' },
  { value: 'laserwave', label: 'Laserwave', category: 'dark' },
  { value: 'light-plus', label: 'Light Plus', category: 'light' },
  { value: 'material-theme', label: 'Material Theme', category: 'dark' },
  {
    value: 'material-theme-darker',
    label: 'Material Theme Darker',
    category: 'dark',
  },
  {
    value: 'material-theme-ocean',
    label: 'Material Theme Ocean',
    category: 'dark',
  },
  {
    value: 'material-theme-palenight',
    label: 'Material Theme Palenight',
    category: 'dark',
  },
  {
    value: 'material-theme-lighter',
    label: 'Material Theme Lighter',
    category: 'light',
  },
  { value: 'min-dark', label: 'Min Dark', category: 'dark' },
  { value: 'min-light', label: 'Min Light', category: 'light' },
  { value: 'monokai', label: 'Monokai', category: 'dark' },
  { value: 'night-owl', label: 'Night Owl', category: 'dark' },
  { value: 'nord', label: 'Nord', category: 'dark' },
  { value: 'one-dark-pro', label: 'One Dark Pro', category: 'dark' },
  { value: 'one-light', label: 'One Light', category: 'light' },
  { value: 'plastic', label: 'Plastic', category: 'dark' },
  { value: 'poimandres', label: 'Poimandres', category: 'dark' },
  { value: 'red', label: 'Red', category: 'dark' },
  { value: 'rose-pine', label: 'Rosé Pine', category: 'dark' },
  { value: 'rose-pine-dawn', label: 'Rosé Pine Dawn', category: 'light' },
  { value: 'rose-pine-moon', label: 'Rosé Pine Moon', category: 'dark' },
  { value: 'slack-dark', label: 'Slack Dark', category: 'dark' },
  { value: 'slack-ochin', label: 'Slack Ochin', category: 'light' },
  { value: 'snazzy-light', label: 'Snazzy Light', category: 'light' },
  { value: 'solarized-dark', label: 'Solarized Dark', category: 'dark' },
  { value: 'solarized-light', label: 'Solarized Light', category: 'light' },
  { value: 'synthwave-84', label: 'Synthwave 84', category: 'dark' },
  { value: 'tokyo-night', label: 'Tokyo Night', category: 'dark' },
  { value: 'vesper', label: 'Vesper', category: 'dark' },
  { value: 'vitesse-black', label: 'Vitesse Black', category: 'dark' },
  { value: 'vitesse-dark', label: 'Vitesse Dark', category: 'dark' },
  { value: 'vitesse-light', label: 'Vitesse Light', category: 'light' },
];

interface SearchableThemeSelectorProps {
  value: BundledTheme;
  onChange: (theme: BundledTheme) => void;
}

const SearchableThemeSelector: Component<SearchableThemeSelectorProps> = (
  props,
) => {
  const { colors } = useTheme();
  const filterFn = useFilter({ sensitivity: 'base' });
  const [triggerClicked, setTriggerClicked] = createSignal(false);
  
  // Apply dynamic styles for hover and selected states
  createEffect(() => {
    const themeColors = colors();
    if (!themeColors) return;
    
    // Create or update style element for dynamic states
    let styleEl = document.getElementById('theme-selector-dynamic-styles') as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'theme-selector-dynamic-styles';
      document.head.appendChild(styleEl);
    }
    
    styleEl.textContent = `
      .theme-selector-item[data-highlighted] {
        background-color: ${themeColors['list.hoverBackground']} !important;
      }
      .theme-selector-item[data-selected] {
        background-color: ${themeColors['list.activeSelectionBackground']} !important;
        color: ${themeColors['list.activeSelectionForeground']} !important;
      }
      .theme-selector-item[data-selected] .theme-category-badge {
        opacity: 0.8 !important;
      }
    `;
  });
  
  onCleanup(() => {
    const styleEl = document.getElementById('theme-selector-dynamic-styles');
    if (styleEl) {
      styleEl.remove();
    }
  });

  const { collection, filter } = useListCollection<ThemeOption>({
    initialItems: themes,
    filter: filterFn().contains,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  });

  const handleInputChange = (details: any) => {
    // Only filter if user is typing, not when trigger was clicked
    if (!triggerClicked()) {
      filter(details.inputValue);
    }
    setTriggerClicked(false);
  };

  const handleValueChange = (details: any) => {
    if (details.value[0]) {
      props.onChange(details.value[0] as BundledTheme);
    }
  };

  const handleTriggerClick = () => {
    setTriggerClicked(true);
    // Clear filter to show all themes
    filter('');
  };

  return (
    <Combobox.Root
      collection={collection()}
      value={[props.value]}
      onValueChange={handleValueChange}
      onInputValueChange={handleInputChange}
      class="min-w-200px"
      multiple={false}
    >
      <Combobox.Control class="relative flex items-center">
        <Combobox.Input
          class="rounded-6px pr-32px pl-12px py-8px text-14px w-full cursor-pointer focus:outline-none focus:cursor-text transition-border-color"
          style={{
            'background-color': colors()?.['input.background'] || 'var(--theme-input-background)',
            border: `1px solid ${colors()?.['input.border'] || 'var(--theme-input-border)'}`,
            color: colors()?.['input.foreground'] || 'var(--theme-input-foreground)'
          }}
          onFocus={(e) => {
            const target = e.target as HTMLInputElement;
            target.style.borderColor = colors()?.['focusBorder'] || 'var(--theme-focusBorder)';
          }}
          onBlur={(e) => {
            const target = e.target as HTMLInputElement;
            target.style.borderColor = colors()?.['input.border'] || 'var(--theme-input-border)';
          }}
          placeholder="Search themes..."
        />
        <Combobox.Trigger
          class="absolute right-0 top-0 bottom-0 flex items-center px-8px cursor-pointer border-none"
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
        <Combobox.Content class="rounded-6px max-h-300px overflow-y-auto z-1000 shadow-[0_4px_12px_rgba(0,0,0,0.3)] py-4px" style={{
          'background-color': colors()?.['dropdown.background'] || 'var(--theme-dropdown-background)',
          border: `1px solid ${colors()?.['dropdown.border'] || 'var(--theme-dropdown-border)'}`
        }}>
          <For each={collection().items}>
            {(theme) => (
              <Combobox.Item
                item={theme}
                class="theme-selector-item flex justify-between items-center px-12px py-8px cursor-pointer text-14px transition-colors duration-100"
                style={{
                  color: colors()?.['list.inactiveSelectionForeground'] || colors()?.['editor.foreground'] || 'var(--theme-editor-foreground)'
                }}
                data-selected={theme.value === props.value ? '' : undefined}
              >
                <Combobox.ItemText class="flex-1">
                  {theme.label}
                </Combobox.ItemText>
                <span class="theme-category-badge text-12px px-6px py-2px rounded-4px font-500 uppercase tracking-[0.5px] ml-8px" style={{
                  'background-color': colors()?.['badge.background'] || 'var(--theme-badge-background)',
                  color: colors()?.['badge.foreground'] || 'var(--theme-badge-foreground)',
                  opacity: theme.category === 'dark' ? '0.9' : '0.7'
                }}>
                  {theme.category}
                </span>
              </Combobox.Item>
            )}
          </For>
        </Combobox.Content>
      </Combobox.Positioner>
    </Combobox.Root>
  );
};

export default SearchableThemeSelector;