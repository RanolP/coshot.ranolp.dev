import type { Component } from 'solid-js';
import { For, createSignal } from 'solid-js';
import { Combobox, useListCollection } from '@ark-ui/solid/combobox';
import { useFilter } from '@ark-ui/solid/locale';
import type { BundledTheme } from 'shiki';

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
  { value: 'rose-pine', label: 'Rose Pine', category: 'dark' },
  { value: 'rose-pine-moon', label: 'Rose Pine Moon', category: 'dark' },
  { value: 'rose-pine-dawn', label: 'Rose Pine Dawn', category: 'light' },
  { value: 'slack-dark', label: 'Slack Dark', category: 'dark' },
  { value: 'slack-ochin', label: 'Slack Ochin', category: 'dark' },
  { value: 'snazzy-light', label: 'Snazzy Light', category: 'light' },
  { value: 'solarized-dark', label: 'Solarized Dark', category: 'dark' },
  { value: 'solarized-light', label: 'Solarized Light', category: 'light' },
  { value: 'synthwave-84', label: "Synthwave '84", category: 'dark' },
  { value: 'tokyo-night', label: 'Tokyo Night', category: 'dark' },
  { value: 'vesper', label: 'Vesper', category: 'dark' },
  { value: 'vitesse-black', label: 'Vitesse Black', category: 'dark' },
  { value: 'vitesse-dark', label: 'Vitesse Dark', category: 'dark' },
  { value: 'vitesse-light', label: 'Vitesse Light', category: 'light' },
  { value: 'aurora-x', label: 'Aurora X', category: 'light' },
];

interface SearchableThemeSelectorProps {
  value: BundledTheme;
  onChange: (theme: BundledTheme) => void;
}

const SearchableThemeSelector: Component<SearchableThemeSelectorProps> = (
  props,
) => {
  const filterFn = useFilter({ sensitivity: 'base' });
  const [triggerClicked, setTriggerClicked] = createSignal(false);

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
          class="bg-[#1a1a1a] border-1 border-[#555] rounded-6px text-white pr-32px pl-12px py-8px text-14px w-full cursor-pointer focus:outline-none focus:border-[#0969da] focus:cursor-text"
          placeholder="Search themes..."
        />
        <Combobox.Trigger
          class="absolute right-0 top-0 bottom-0 flex items-center px-8px cursor-pointer bg-none border-none"
          onClick={handleTriggerClick}
        >
          <div class="i-lucide:chevron-down text-[#888] w-16px h-16px transition-transform duration-200 data-[state=open]:rotate-180" />
        </Combobox.Trigger>
      </Combobox.Control>

      <Combobox.Positioner>
        <Combobox.Content class="bg-[#1a1a1a] border-1 border-[#555] rounded-6px max-h-300px overflow-y-auto z-1000 shadow-[0_4px_12px_rgba(0,0,0,0.3)] py-4px">
          <For each={collection().items}>
            {(theme) => (
              <Combobox.Item
                item={theme}
                class="flex justify-between items-center px-12px py-8px cursor-pointer text-14px transition-colors duration-100 text-white hover:bg-[#2a2a2a]"
                data-selected={theme.value === props.value ? '' : undefined}
              >
                <Combobox.ItemText class="flex-1">
                  {theme.label}
                </Combobox.ItemText>
                <span class={`text-12px px-6px py-2px rounded-4px font-500 uppercase tracking-[0.5px] ml-8px ${theme.category === 'dark' ? 'bg-[#2d1b69] text-[#a78bfa]' : 'bg-[#fbbf24] text-[#92400e]'}`}>
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
