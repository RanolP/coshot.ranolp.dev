import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import FeaturesModal from './FeaturesModal';
import { useTheme } from '../contexts/ThemeContext';

const TopBar: Component = () => {
  const [showModal, setShowModal] = createSignal(false);
  const { colors } = useTheme();

  return (
    <>
      <div 
        class="h-60px flex items-center px-20px flex-shrink-0"
        style={{
          'background-color': colors()?.['titleBar.activeBackground'] || 'var(--theme-titleBar-activeBackground)',
          'border-bottom': `1px solid ${colors()?.['titleBar.border'] || 'var(--theme-titleBar-border)'}`
        }}
      >
        <div class="w-full flex justify-between items-center">
          <h1 
            class="text-24px font-600 m-0"
            style={{ color: colors()?.['titleBar.activeForeground'] || 'var(--theme-titleBar-activeForeground)' }}
          >
            Coshot
          </h1>
          <button
            class="w-36px h-36px rounded-full border-2 cursor-pointer flex items-center justify-center transition-all duration-200"
            style={{
              'background-color': colors()?.['button.background'] || 'var(--theme-button-background)',
              'border-color': colors()?.['input.border'] || 'var(--theme-input-border)',
              color: colors()?.['button.foreground'] || 'var(--theme-button-foreground)'
            }}
            onClick={() => setShowModal(true)}
            title="Features & TwoSlash Tips"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors()?.['button.hoverBackground'] || 'var(--theme-button-hoverBackground)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors()?.['button.background'] || 'var(--theme-button-background)';
            }}
          >
            <div class="i-lucide:help-circle w-20px h-20px" />
          </button>
        </div>
      </div>
      <FeaturesModal isOpen={showModal()} onClose={() => setShowModal(false)} />
    </>
  );
};

export default TopBar;
