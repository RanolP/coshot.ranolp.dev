import type { Component } from 'solid-js';
import { createMemo, createSignal, Show } from 'solid-js';
import { Tooltip } from '@ark-ui/solid';
import { getLanguageDisplayName } from '../utils/languageNames';

interface TwoslashToggleProps {
  enabled: boolean;
  language: string;
  onToggle: (enabled: boolean) => void;
}

const TWOSLASH_SUPPORTED_LANGUAGES = ['typescript', 'tsx', 'javascript', 'jsx'];

const TwoslashToggle: Component<TwoslashToggleProps> = (props) => {
  const [showUnsupportedTooltip, setShowUnsupportedTooltip] = createSignal(false);
  
  const isSupported = createMemo(() => 
    TWOSLASH_SUPPORTED_LANGUAGES.includes(props.language)
  );

  const toggleState = createMemo(() => {
    if (!props.enabled) return 'disabled';
    if (isSupported()) return 'enabled-supported';
    return 'enabled-unsupported';
  });

  const handleClick = () => {
    // Show tooltip when clicking on enabled-unsupported state
    if (toggleState() === 'enabled-unsupported') {
      setShowUnsupportedTooltip(true);
      // Hide tooltip after 3 seconds
      setTimeout(() => setShowUnsupportedTooltip(false), 3000);
      return; // Don't toggle, just show tooltip
    }
    
    // Only allow toggling if language is supported
    if (isSupported()) {
      props.onToggle(!props.enabled);
    }
  };

  const getStateClasses = createMemo(() => {
    const state = toggleState();
    
    if (state === 'disabled') {
      const cursorClass = isSupported() ? 'cursor-pointer' : 'cursor-not-allowed';
      const opacityClass = isSupported() ? '' : 'opacity-50';
      return `bg-gray-500 text-white border-1 border-gray-500 ${cursorClass} ${opacityClass}`;
    } else if (state === 'enabled-supported') {
      return 'bg-blue-600 text-white border-1 border-blue-600 cursor-pointer';
    } else {
      // enabled-unsupported
      return 'bg-white text-blue-600 border-1 border-blue-600 cursor-pointer';
    }
  });

  const getTooltip = () => {
    const state = toggleState();
    if (state === 'disabled' && !isSupported()) {
      return 'TwoSlash is not supported for this language';
    } else if (state === 'enabled-unsupported') {
      return 'TwoSlash enabled but not supported for this language';
    } else if (state === 'enabled-supported') {
      return 'TwoSlash enabled - Click to disable';
    } else {
      return 'Click to enable TwoSlash';
    }
  };

  return (
    <Tooltip.Root open={showUnsupportedTooltip()} openDelay={0} closeDelay={0}>
      <Tooltip.Trigger
        type="button"
        onClick={handleClick}
        class={`px-12px py-6px rounded-6px text-14px font-500 transition-all duration-200 flex items-center gap-6px select-none ${getStateClasses()}`}
        title={getTooltip()}
        disabled={!isSupported() && !props.enabled}
        data-state={toggleState()}
      >
        {toggleState() === 'disabled' && <div class="i-lucide-x w-14px h-14px" />}
        {toggleState() === 'enabled-supported' && <div class="i-lucide-check w-14px h-14px" />}
        {toggleState() === 'enabled-unsupported' && <div class="i-lucide-alert-circle w-14px h-14px" />}
        <span>TwoSlash</span>
      </Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content class="bg-gray-900 text-white px-12px py-8px rounded-6px text-13px max-w-250px shadow-lg">
          <Tooltip.Arrow>
            <Tooltip.ArrowTip class="border-t-gray-900" />
          </Tooltip.Arrow>
          <div class="flex items-start gap-8px">
            <div class="i-lucide-info w-16px h-16px flex-shrink-0 mt-1px" />
            <div>
              <div class="font-600 mb-4px">TwoSlash Not Supported</div>
              <div class="text-12px opacity-90">
                TwoSlash is only available for TypeScript, TSX, JavaScript, and JSX files. 
                Current language: <span class="font-600">{getLanguageDisplayName(props.language)}</span>
              </div>
            </div>
          </div>
        </Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  );
};

export default TwoslashToggle;