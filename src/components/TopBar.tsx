import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import FeaturesModal from './FeaturesModal';

const TopBar: Component = () => {
  const [showModal, setShowModal] = createSignal(false);

  return (
    <>
      <div class="top-bar">
        <div class="top-bar-content">
          <h1 class="logo">Coshot</h1>
          <button
            class="help-button"
            onClick={() => setShowModal(true)}
            title="Features & TwoSlash Tips"
          >
            <div class="i-lucide:help-circle" />
          </button>
        </div>
      </div>
      <FeaturesModal isOpen={showModal()} onClose={() => setShowModal(false)} />
    </>
  );
};

export default TopBar;
