import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import FeaturesModal from './FeaturesModal';

const TopBar: Component = () => {
  const [showModal, setShowModal] = createSignal(false);

  return (
    <>
      <div class="h-60px bg-[#1a1a1a] border-b-1 border-[#333] flex items-center px-20px flex-shrink-0 light:bg-[#f6f8fa] light:border-[#d0d7de]">
        <div class="w-full flex justify-between items-center">
          <h1 class="text-white text-24px font-600 m-0 light:text-[#1f2328]">Coshot</h1>
          <button
            class="w-36px h-36px rounded-full border-2 border-[#555] bg-[#2a2a2a] text-white cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-[#3a3a3a] hover:border-[#666] light:bg-white light:border-[#d0d7de] light:text-[#1f2328] light:hover:bg-[#f3f4f6] light:hover:border-[#8c959f]"
            onClick={() => setShowModal(true)}
            title="Features & TwoSlash Tips"
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
