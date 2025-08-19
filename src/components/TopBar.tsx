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
      </div>
      <FeaturesModal isOpen={showModal()} onClose={() => setShowModal(false)} />
    </>
  );
};

export default TopBar;
